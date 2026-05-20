/**
 * Test Suite: TaskService
 * Covers: FR1, FR2, FR3, FR4, FR6 (sort), FR7 (filter), FR10 (export)
 */

const path = require('path');
const fs = require('fs');
const { TaskRepository, resetRepository } = require('../src/repositories/TaskRepository');
const TaskService = require('../src/services/TaskService');

const TEST_FILE = path.join(__dirname, '../data/tasks_test_service.json');
const EXPORT_FILE = path.join(__dirname, '../data/tasks_test_export.txt');

let service;

beforeEach(() => {
  resetRepository();
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
  const repo = new TaskRepository(TEST_FILE);
  service = new TaskService(repo);
});

afterAll(() => {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
  if (fs.existsSync(EXPORT_FILE)) fs.unlinkSync(EXPORT_FILE);
});

// ─── FR1: Create Task ─────────────────────────────────────────────────────────

describe('FR1 - createTask via Service', () => {
  /**
   * TC-18
   * Requirement: FR1
   * Objective: Verify that service creates a task and persists it
   * Preconditions: Empty repository
   * Steps: Call service.createTask() with valid data
   * Expected: Task is returned and exists in storage
   */
  test('TC-18: should create and store a new task', () => {
    const task = service.createTask({
      title: 'Buy groceries',
      deadline: '2026-06-10',
      priority: 'Medium',
    });

    expect(task.title).toBe('Buy groceries');
    expect(service.getAllTasks()).toHaveLength(1);
  });
});

// ─── FR2: Edit Task ───────────────────────────────────────────────────────────

describe('FR2 - editTask via Service', () => {
  /**
   * TC-19
   * Requirement: FR2
   * Objective: Verify that service updates an existing task
   * Preconditions: A task exists in storage
   * Steps: Create task, then call service.editTask(id, updates)
   * Expected: Returned task has updated fields
   */
  test('TC-19: should update an existing task', () => {
    const task = service.createTask({ title: 'Old title', deadline: '2026-06-01', priority: 'Low' });
    const updated = service.editTask(task.id, { title: 'New title' });

    expect(updated.title).toBe('New title');
  });

  /**
   * TC-20
   * Requirement: FR2
   * Objective: Verify that editing a non-existent task throws an error
   * Preconditions: Empty repository
   * Steps: Call service.editTask() with a fake ID
   * Expected: Error is thrown mentioning "not found"
   */
  test('TC-20: should throw error when editing non-existent task', () => {
    expect(() => service.editTask('fake-id', { title: 'X' })).toThrow('not found');
  });
});

// ─── FR3: Delete Task ─────────────────────────────────────────────────────────

describe('FR3 - deleteTask via Service', () => {
  /**
   * TC-21
   * Requirement: FR3
   * Objective: Verify that service deletes an existing task
   * Preconditions: A task exists in storage
   * Steps: Create task, call service.deleteTask(id)
   * Expected: Returns true, task is no longer in storage
   */
  test('TC-21: should delete an existing task', () => {
    const task = service.createTask({ title: 'Delete me', deadline: '2026-06-01', priority: 'Low' });
    const result = service.deleteTask(task.id);

    expect(result).toBe(true);
    expect(service.getAllTasks()).toHaveLength(0);
  });

  /**
   * TC-22
   * Requirement: FR3
   * Objective: Verify that deleting a non-existent task throws an error
   * Preconditions: Empty repository
   * Steps: Call service.deleteTask('nonexistent')
   * Expected: Error is thrown mentioning "not found"
   */
  test('TC-22: should throw error when deleting non-existent task', () => {
    expect(() => service.deleteTask('nonexistent')).toThrow('not found');
  });
});

// ─── FR4: Get All Tasks ───────────────────────────────────────────────────────

describe('FR4 - getAllTasks via Service', () => {
  /**
   * TC-23
   * Requirement: FR4
   * Objective: Verify that service returns all tasks
   * Preconditions: Three tasks exist in storage
   * Steps: Create 3 tasks, call service.getAllTasks()
   * Expected: Returns array of 3 tasks
   */
  test('TC-23: should return all tasks', () => {
    service.createTask({ title: 'T1', deadline: '2026-06-01', priority: 'High' });
    service.createTask({ title: 'T2', deadline: '2026-06-02', priority: 'Medium' });
    service.createTask({ title: 'T3', deadline: '2026-06-03', priority: 'Low' });

    expect(service.getAllTasks()).toHaveLength(3);
  });
});

// ─── FR6: Sort Tasks ──────────────────────────────────────────────────────────

describe('FR6 - Sort tasks', () => {
  beforeEach(() => {
    service.createTask({ title: 'Late task',  deadline: '2026-12-01', priority: 'Low' });
    service.createTask({ title: 'Early task', deadline: '2026-01-01', priority: 'High' });
    service.createTask({ title: 'Mid task',   deadline: '2026-06-01', priority: 'Medium' });
  });

  /**
   * TC-24
   * Requirement: FR6
   * Objective: Verify sorting tasks by deadline ascending
   * Preconditions: 3 tasks with different deadlines exist
   * Steps: Call service.getSortedTasks('deadline', 'asc')
   * Expected: Tasks ordered earliest to latest deadline
   */
  test('TC-24: should sort by deadline ascending', () => {
    const sorted = service.getSortedTasks('deadline', 'asc');
    expect(sorted[0].title).toBe('Early task');
    expect(sorted[2].title).toBe('Late task');
  });

  /**
   * TC-25
   * Requirement: FR6
   * Objective: Verify sorting tasks by priority (High > Medium > Low)
   * Preconditions: 3 tasks with different priorities exist
   * Steps: Call service.getSortedTasks('priority', 'asc')
   * Expected: High priority task is first
   */
  test('TC-25: should sort by priority (High first)', () => {
    const sorted = service.getSortedTasks('priority', 'asc');
    expect(sorted[0].priority).toBe('High');
    expect(sorted[2].priority).toBe('Low');
  });

  /**
   * TC-26
   * Requirement: FR6
   * Objective: Verify that invalid sort field throws error
   * Preconditions: Tasks exist
   * Steps: Call service.getSortedTasks('name')
   * Expected: Error is thrown
   */
  test('TC-26: should throw error for invalid sort field', () => {
    expect(() => service.getSortedTasks('name')).toThrow('Invalid sort field');
  });
});

// ─── FR7: Filter Tasks ────────────────────────────────────────────────────────

describe('FR7 - Filter tasks', () => {
  beforeEach(() => {
    const t1 = service.createTask({ title: 'High task',   deadline: '2026-06-01', priority: 'High' });
    const t2 = service.createTask({ title: 'Medium task', deadline: '2026-06-02', priority: 'Medium' });
    service.markAsCompleted(t1.id);
    // t2 stays as ToDo
  });

  /**
   * TC-27
   * Requirement: FR7
   * Objective: Verify filtering to show only completed tasks
   * Preconditions: 1 completed and 1 not-completed task exist
   * Steps: Call service.getFilteredTasks('completed')
   * Expected: Returns only the completed task
   */
  test('TC-27: should filter only completed tasks', () => {
    const result = service.getFilteredTasks('completed');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('Completed');
  });

  /**
   * TC-28
   * Requirement: FR7
   * Objective: Verify filtering to show only not-completed tasks
   * Preconditions: 1 completed and 1 not-completed task exist
   * Steps: Call service.getFilteredTasks('not-completed')
   * Expected: Returns only the ToDo task
   */
  test('TC-28: should filter only not-completed tasks', () => {
    const result = service.getFilteredTasks('not-completed');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('ToDo');
  });

  /**
   * TC-29
   * Requirement: FR7
   * Objective: Verify filtering to show only high priority tasks
   * Preconditions: Tasks with different priorities exist
   * Steps: Call service.getFilteredTasks('high-priority')
   * Expected: Returns only High priority tasks
   */
  test('TC-29: should filter only high priority tasks', () => {
    const result = service.getFilteredTasks('high-priority');
    expect(result.every(t => t.priority === 'High')).toBe(true);
  });

  /**
   * TC-30
   * Requirement: FR7
   * Objective: Verify that invalid filter value throws an error
   * Preconditions: Tasks exist
   * Steps: Call service.getFilteredTasks('urgent')
   * Expected: Error is thrown
   */
  test('TC-30: should throw error for invalid filter value', () => {
    expect(() => service.getFilteredTasks('urgent')).toThrow('Invalid filter');
  });
});

// ─── FR10: Export Tasks ───────────────────────────────────────────────────────

describe('FR10 - Export tasks to text file', () => {
  /**
   * TC-31
   * Requirement: FR10
   * Objective: Verify that tasks are exported to a readable text file
   * Preconditions: At least one task exists
   * Steps: Create a task, call service.exportToTextFile(path)
   * Expected: File is created and contains the task title
   */
  test('TC-31: should create a text file with task data', () => {
    service.createTask({ title: 'Export me', deadline: '2026-06-01', priority: 'High' });
    service.exportToTextFile(EXPORT_FILE);

    expect(fs.existsSync(EXPORT_FILE)).toBe(true);
    const content = fs.readFileSync(EXPORT_FILE, 'utf-8');
    expect(content).toContain('Export me');
  });

  /**
   * TC-32
   * Requirement: FR10
   * Objective: Verify that exporting with no tasks throws an error
   * Preconditions: Empty repository
   * Steps: Call service.exportToTextFile() without any tasks
   * Expected: Error is thrown mentioning no tasks
   */
  test('TC-32: should throw error when there are no tasks to export', () => {
    expect(() => service.exportToTextFile(EXPORT_FILE)).toThrow('No tasks to export');
  });
});
