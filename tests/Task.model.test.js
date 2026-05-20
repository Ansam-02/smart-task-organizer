/**
 * Test Suite: Task Model
 * Covers: FR1, FR2, FR5, FR6
 */

const Task = require('../src/models/Task');

// ─── FR1: Create Task ─────────────────────────────────────────────────────────

describe('FR1 - Create a new task', () => {
  /**
   * TC-01
   * Requirement: FR1
   * Objective: Verify that a task is created with all required fields
   * Preconditions: None
   * Steps: Call Task.create() with valid title, description, deadline, priority
   * Expected: Task object has the correct field values
   */
  test('TC-01: should create a task with all valid fields', () => {
    const task = Task.create({
      title: 'Write report',
      description: 'Write the final report',
      deadline: '2026-06-01',
      priority: 'High',
    });

    expect(task.title).toBe('Write report');
    expect(task.description).toBe('Write the final report');
    expect(task.deadline).toBe('2026-06-01');
    expect(task.priority).toBe('High');
    expect(task.id).toBeDefined();
  });

  /**
   * TC-02
   * Requirement: FR1
   * Objective: Verify that creating a task without a title throws an error
   * Preconditions: None
   * Steps: Call Task.create() with missing title
   * Expected: Error is thrown with message about title
   */
  test('TC-02: should throw an error if title is missing', () => {
    expect(() => Task.create({ deadline: '2026-06-01', priority: 'Low' }))
      .toThrow('Title is required');
  });

  /**
   * TC-03
   * Requirement: FR1
   * Objective: Verify that creating a task without a deadline throws an error
   * Preconditions: None
   * Steps: Call Task.create() with missing deadline
   * Expected: Error is thrown with message about deadline
   */
  test('TC-03: should throw an error if deadline is missing', () => {
    expect(() => Task.create({ title: 'Task', priority: 'Low' }))
      .toThrow('Deadline is required');
  });

  /**
   * TC-04
   * Requirement: FR1
   * Objective: Verify that invalid priority value throws an error
   * Preconditions: None
   * Steps: Call Task.create() with priority = 'Critical'
   * Expected: Error is thrown mentioning valid priorities
   */
  test('TC-04: should throw an error for invalid priority', () => {
    expect(() => Task.create({ title: 'Task', deadline: '2026-06-01', priority: 'Critical' }))
      .toThrow('Priority must be one of');
  });

  /**
   * TC-05
   * Requirement: FR1
   * Objective: Verify that all three priority values are accepted
   * Preconditions: None
   * Steps: Create tasks with High, Medium, Low priorities
   * Expected: All three tasks are created successfully
   */
  test('TC-05: should accept High, Medium, and Low as valid priorities', () => {
    expect(() => Task.create({ title: 'T1', deadline: '2026-06-01', priority: 'High' })).not.toThrow();
    expect(() => Task.create({ title: 'T2', deadline: '2026-06-01', priority: 'Medium' })).not.toThrow();
    expect(() => Task.create({ title: 'T3', deadline: '2026-06-01', priority: 'Low' })).not.toThrow();
  });
});

// ─── FR5: Default Status ──────────────────────────────────────────────────────

describe('FR5 - Default task status is ToDo', () => {
  /**
   * TC-06
   * Requirement: FR5
   * Objective: Verify that a newly created task has status "ToDo" by default
   * Preconditions: None
   * Steps: Create a task using Task.create()
   * Expected: task.status === 'ToDo'
   */
  test('TC-06: new task should have status "ToDo" by default', () => {
    const task = Task.create({
      title: 'Default status task',
      deadline: '2026-07-01',
      priority: 'Medium',
    });

    expect(task.status).toBe('ToDo');
  });
});

// ─── FR6: Mark as Completed ───────────────────────────────────────────────────

describe('FR6 - Mark task as Completed', () => {
  /**
   * TC-07
   * Requirement: FR6
   * Objective: Verify that calling markAsCompleted() changes status to "Completed"
   * Preconditions: A task exists with status "ToDo"
   * Steps: Call task.markAsCompleted()
   * Expected: task.status === 'Completed' and updatedAt is refreshed
   */
  test('TC-07: should change status to "Completed"', () => {
    const task = Task.create({
      title: 'Finish homework',
      deadline: '2026-06-15',
      priority: 'High',
    });

    task.markAsCompleted();

    expect(task.status).toBe('Completed');
    expect(task.updatedAt).toBeDefined();
  });
});

// ─── FR2: Edit Task ───────────────────────────────────────────────────────────

describe('FR2 - Edit an existing task', () => {
  /**
   * TC-08
   * Requirement: FR2
   * Objective: Verify that task fields can be updated
   * Preconditions: A task exists
   * Steps: Call task.update() with new title and priority
   * Expected: Task fields are updated correctly
   */
  test('TC-08: should update task title and priority', () => {
    const task = Task.create({
      title: 'Old title',
      deadline: '2026-06-01',
      priority: 'Low',
    });

    task.update({ title: 'New title', priority: 'High' });

    expect(task.title).toBe('New title');
    expect(task.priority).toBe('High');
  });

  /**
   * TC-09
   * Requirement: FR2
   * Objective: Verify that updating with an invalid priority throws an error
   * Preconditions: A task exists
   * Steps: Call task.update() with priority = 'Urgent'
   * Expected: Error is thrown
   */
  test('TC-09: should throw error when updating with invalid priority', () => {
    const task = Task.create({
      title: 'Task',
      deadline: '2026-06-01',
      priority: 'Low',
    });

    expect(() => task.update({ priority: 'Urgent' })).toThrow('Priority must be one of');
  });

  /**
   * TC-10
   * Requirement: FR2
   * Objective: Verify that updating with an empty title throws an error
   * Preconditions: A task exists
   * Steps: Call task.update() with title = ''
   * Expected: Error is thrown
   */
  test('TC-10: should throw error when updating with empty title', () => {
    const task = Task.create({
      title: 'Task',
      deadline: '2026-06-01',
      priority: 'Low',
    });

    expect(() => task.update({ title: '' })).toThrow('Title cannot be empty');
  });
});
