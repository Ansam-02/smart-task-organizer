/**
 * Test Suite: REST API Integration Tests
 * Covers: All endpoints (FR1–FR10 via HTTP)
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'test';

const TASKS_FILE = path.join(__dirname, '../data/tasks.json');

const app = require('../src/app');

beforeEach(() => {
  // Reset tasks file before each test for a clean state
  fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf-8');
});

afterAll(() => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf-8');
});

// ─── Health Check ─────────────────────────────────────────────────────────────

describe('GET / - Health check', () => {
  test('TC-33: should return 200 with running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('running');
  });
});

// ─── FR1: POST /api/tasks ─────────────────────────────────────────────────────

describe('POST /api/tasks - FR1', () => {
  /**
   * TC-34
   * Requirement: FR1
   * Objective: Verify that the API creates a task and returns 201
   * Preconditions: Server is running
   * Steps: Send POST /api/tasks with valid body
   * Expected: 201 status, success: true, task in response
   */
  test('TC-34: should create a task and return 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'API Task', deadline: '2026-06-01', priority: 'High' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('API Task');
  });

  /**
   * TC-35
   * Requirement: FR1
   * Objective: Verify that missing title returns 400
   * Preconditions: Server is running
   * Steps: Send POST /api/tasks without title
   * Expected: 400 status, success: false
   */
  test('TC-35: should return 400 if title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ deadline: '2026-06-01', priority: 'High' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── FR4: GET /api/tasks ──────────────────────────────────────────────────────

describe('GET /api/tasks - FR4', () => {
  /**
   * TC-36
   * Requirement: FR4
   * Objective: Verify that the API returns all tasks
   * Preconditions: Two tasks exist
   * Steps: Create 2 tasks, then GET /api/tasks
   * Expected: 200 status, count = 2
   */
  test('TC-36: should return all tasks with count', async () => {
    await request(app).post('/api/tasks').send({ title: 'T1', deadline: '2026-06-01', priority: 'High' });
    await request(app).post('/api/tasks').send({ title: 'T2', deadline: '2026-06-02', priority: 'Low' });

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });
});

// ─── FR5: Default status ──────────────────────────────────────────────────────

describe('FR5 - Default status via API', () => {
  /**
   * TC-37
   * Requirement: FR5
   * Objective: Verify that a new task from the API has status "ToDo"
   * Preconditions: Server is running
   * Steps: POST /api/tasks, check returned status
   * Expected: status === 'ToDo'
   */
  test('TC-37: new task should have status ToDo', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Status test', deadline: '2026-06-01', priority: 'Medium' });

    expect(res.body.data.status).toBe('ToDo');
  });
});

// ─── FR2: PUT /api/tasks/:id ──────────────────────────────────────────────────

describe('PUT /api/tasks/:id - FR2', () => {
  /**
   * TC-38
   * Requirement: FR2
   * Objective: Verify that the API updates an existing task
   * Preconditions: A task exists
   * Steps: Create task, PUT with new title
   * Expected: 200 status, updated title in response
   */
  test('TC-38: should update a task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Before', deadline: '2026-06-01', priority: 'Low' });

    const id = create.body.data.id;
    const res = await request(app).put(`/api/tasks/${id}`).send({ title: 'After' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('After');
  });

  /**
   * TC-39
   * Requirement: FR2
   * Objective: Verify that updating a non-existent task returns 404
   * Preconditions: No tasks exist
   * Steps: PUT /api/tasks/fake-id
   * Expected: 404 status
   */
  test('TC-39: should return 404 for non-existent task', async () => {
    const res = await request(app).put('/api/tasks/fake-id').send({ title: 'X' });
    expect(res.status).toBe(404);
  });
});

// ─── FR3: DELETE /api/tasks/:id ───────────────────────────────────────────────

describe('DELETE /api/tasks/:id - FR3', () => {
  /**
   * TC-40
   * Requirement: FR3
   * Objective: Verify that the API deletes an existing task
   * Preconditions: A task exists
   * Steps: Create task, DELETE by ID
   * Expected: 200 status, success: true
   */
  test('TC-40: should delete an existing task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Delete via API', deadline: '2026-06-01', priority: 'Low' });

    const id = create.body.data.id;
    const res = await request(app).delete(`/api/tasks/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  /**
   * TC-41
   * Requirement: FR3
   * Objective: Verify 404 when deleting a non-existent task
   * Preconditions: No tasks exist
   * Steps: DELETE /api/tasks/nonexistent
   * Expected: 404 status
   */
  test('TC-41: should return 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/nonexistent');
    expect(res.status).toBe(404);
  });
});

// ─── FR6: PATCH /api/tasks/:id/complete ──────────────────────────────────────

describe('PATCH /api/tasks/:id/complete - FR6', () => {
  /**
   * TC-42
   * Requirement: FR6
   * Objective: Verify that the API marks a task as Completed
   * Preconditions: A task exists with status ToDo
   * Steps: Create task, PATCH /:id/complete
   * Expected: 200 status, data.status === 'Completed'
   */
  test('TC-42: should mark task as Completed', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Complete me', deadline: '2026-06-01', priority: 'High' });

    const id = create.body.data.id;
    const res = await request(app).patch(`/api/tasks/${id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Completed');
  });
});

// ─── FR6: Sort via GET /api/tasks?sortBy= ────────────────────────────────────

describe('GET /api/tasks?sortBy= - FR6 Sort', () => {
  /**
   * TC-43
   * Requirement: FR6
   * Objective: Verify API sorts tasks by deadline ascending
   * Preconditions: Two tasks with different deadlines exist
   * Steps: GET /api/tasks?sortBy=deadline&order=asc
   * Expected: First task has earlier deadline
   */
  test('TC-43: should sort by deadline ascending', async () => {
    await request(app).post('/api/tasks').send({ title: 'Late',  deadline: '2026-12-01', priority: 'Low' });
    await request(app).post('/api/tasks').send({ title: 'Early', deadline: '2026-01-01', priority: 'High' });

    const res = await request(app).get('/api/tasks?sortBy=deadline&order=asc');

    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Early');
  });
});

// ─── FR7: Filter via GET /api/tasks?filter= ──────────────────────────────────

describe('GET /api/tasks?filter= - FR7', () => {
  /**
   * TC-44
   * Requirement: FR7
   * Objective: Verify API filters completed tasks
   * Preconditions: 1 completed and 1 not-completed task
   * Steps: GET /api/tasks?filter=completed
   * Expected: count = 1, status = Completed
   */
  test('TC-44: should filter completed tasks', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Done', deadline: '2026-06-01', priority: 'High' });
    await request(app).post('/api/tasks').send({ title: 'Pending', deadline: '2026-06-02', priority: 'Low' });
    await request(app).patch(`/api/tasks/${create.body.data.id}/complete`);

    const res = await request(app).get('/api/tasks?filter=completed');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].status).toBe('Completed');
  });

  /**
   * TC-45
   * Requirement: FR7
   * Objective: Verify API filters high priority tasks
   * Preconditions: Tasks with different priorities exist
   * Steps: GET /api/tasks?filter=high-priority
   * Expected: All returned tasks have priority High
   */
  test('TC-45: should filter high priority tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'H', deadline: '2026-06-01', priority: 'High' });
    await request(app).post('/api/tasks').send({ title: 'L', deadline: '2026-06-02', priority: 'Low' });

    const res = await request(app).get('/api/tasks?filter=high-priority');

    expect(res.body.data.every(t => t.priority === 'High')).toBe(true);
  });
});

// ─── FR10: GET /api/tasks/export ─────────────────────────────────────────────

describe('GET /api/tasks/export - FR10', () => {
  /**
   * TC-46
   * Requirement: FR10
   * Objective: Verify that the export endpoint returns a downloadable file
   * Preconditions: At least one task exists
   * Steps: Create task, GET /api/tasks/export
   * Expected: 200 status
   */
  test('TC-46: should export tasks as a text file', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Exported Task', deadline: '2026-06-01', priority: 'High' });

    const res = await request(app).get('/api/tasks/export');

    expect(res.status).toBe(200);
  });

  /**
   * TC-47
   * Requirement: FR10
   * Objective: Verify that export with no tasks returns 400
   * Preconditions: No tasks exist
   * Steps: GET /api/tasks/export on empty repository
   * Expected: 400 status with error message
   */
  test('TC-47: should return 400 when no tasks to export', async () => {
    const res = await request(app).get('/api/tasks/export');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

describe('404 - Unknown endpoint', () => {
  /**
   * TC-48
   * Requirement: NFR
   * Objective: Verify that unknown routes return 404
   * Preconditions: Server is running
   * Steps: GET /api/unknown
   * Expected: 404 status
   */
  test('TC-48: should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
