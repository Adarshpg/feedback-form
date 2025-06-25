const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

// Test data
const testStudent = {
  name: 'Test Student',
  email: 'test@example.com',
  course: 'Computer Science',
  enrollmentNumber: 'CS2023001',
  semester: 5,
  contactNumber: '1234567890',
  address: '123 Test St, Test City'
};

describe('Student Feedback System API', () => {
  // Connect to the database before running tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Disconnect from the database after all tests are done
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Student Endpoints', () => {
    it('should register a new student', async () => {
      const res = await request(app)
        .post('/api/students')
        .send(testStudent);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(testStudent.name);
      expect(res.body.email).toBe(testStudent.email);
    });

    it('should get all students', async () => {
      const res = await request(app).get('/api/students');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Feedback Endpoints', () => {
    let studentId;
    
    beforeAll(async () => {
      // Create a test student for feedback tests
      const res = await request(app)
        .post('/api/students')
        .send({
          name: 'Feedback Test Student',
          email: 'feedback-test@example.com',
          course: 'Computer Science',
          enrollmentNumber: 'CS2023002',
          semester: 5,
          contactNumber: '1234567891',
          address: '124 Test St, Test City'
        });
      
      studentId = res.body._id;
    });

    it('should submit feedback for a student', async () => {
      const feedbackData = {
        studentId,
        completionPercentage: 20,
        answers: [
          { questionId: 'q1', rating: 4, comment: 'Good' },
          { questionId: 'q2', rating: 5, comment: 'Excellent' }
        ],
        additionalComments: 'Great course overall!'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.student).toBe(studentId);
      expect(res.body.completionPercentage).toBe(20);
      expect(res.body.answers.length).toBe(2);
    });

    it('should get feedback for a student', async () => {
      const res = await request(app).get(`/api/feedback/student/${studentId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].student).toBe(studentId);
    });
  });
});
