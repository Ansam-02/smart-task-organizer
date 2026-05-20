/**
 * Test Suite: TaskRepository
 * Covers: FR8 (save), FR9 (load), FR3 (delete), FR4 (getAll)
 */

const path = require('path');
const fs = require('fs');
const { TaskRepository, resetRepository } = require('../src/repositories/TaskRepository');
const Task = require('../src/models/Task');

const TEST_FILE = path.join(__dirname, '../data/tasks_test_repo.json');

let repo;

beforeEach(() => {
  resetRepository();
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
  repo = new TaskRepository(TEST_FILE);
});

afterAll(() => {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
});

// ─── FR9: Load Tasks ──────────────────────────────────────────────────────────

describe('FR9 - Load all saved tasks when system starts', () => {
  /**
   * TC-11
   * Requirement: FR9
   * Objective: Verify that tasks are loaded from the file on startup
   * Preconditions: tasks_test.json contains one saved task
   * Steps: Write a task manually to the JSON file, then call loadAll()
   * Expected: Returns an array with the saved task
   */
  test('TC-11: should load tasks from file', () => {
    const task = Task.create({ title: 'Saved task', deadline: '2026-06-01', priority: 'Low' });
    fs.writeFileSync(TEST_FILE, JSON.stringify([task.toJSON()], null, 2), 'utf-8');

    const loaded = repo.loadAll();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Saved task');
  });

  /**
   * TC-12
   * Requirement: FR9
   * Objective: Verify that an empty file returns an empty array
   * Preconditions: tasks_test.json is empty / new
   * Steps: Call loadAll() on a fresh repository
   * Expected: Returns empty array []
   */
  test('TC-12: should return empty array when file is empty', () => {
    const tasks = repo.loadAll();
    expect(tasks).toEqual([]);
  });
});

// ─── FR8: Save Tasks ──────────────────────────────────────────────────────────

describe('FR8 - Save all tasks to file automatically', () => {
  /**
   * TC-13
   * Requirement: FR8
   * Objective: Verify that tasks are persisted to file after save
   * Preconditions: A task object is created in memory
   * Steps: Call repo.add(task), then read the file and check its content
   * Expected: The file contains the saved task
   */
  test('TC-13: should persist task to file after add()', () => {
    const task = Task.create({ title: 'Persisted task', deadline: '2026-07-01', priority: 'Medium' });
    repo.add(task);

    const raw = JSON.parse(fs.readFileSync(TEST_FILE, 'utf-8'));
    expect(raw).toHaveLength(1);
    expect(raw[0].title).toBe('Persisted task');
  });

  /**
   * TC-14
   * Requirement: FR8
   * Objective: Verify that saveAll() overwrites old data with current task list
   * Preconditions: File has one task
   * Steps: Call saveAll() with a different list
   * Expected: File reflects the new list only
   */
  test('TC-14: should overwrite file with updated task list', () => {
    const t1 = Task.create({ title: 'Task A', deadline: '2026-06-01', priority: 'High' });
    const t2 = Task.create({ title: 'Task B', deadline: '2026-06-02', priority: 'Low' });
    repo.saveAll([t1, t2]);

    const raw = JSON.parse(fs.readFileSync(TEST_FILE, 'utf-8'));
    expect(raw).toHaveLength(2);
    expect(raw.map(t => t.title)).toContain('Task A');
    expect(raw.map(t => t.title)).toContain('Task B');
  });
});

// ─── FR3: Delete Task ─────────────────────────────────────────────────────────

describe('FR3 - Delete a task', () => {
  /**
   * TC-15
   * Requirement: FR3
   * Objective: Verify that a task is removed from the repository
   * Preconditions: A task exists in the repository
   * Steps: Add a task, then call repo.delete(id)
   * Expected: Returns true and task no longer exists in file
   */
  test('TC-15: should delete an existing task by ID', () => {
    const task = Task.create({ title: 'To delete', deadline: '2026-06-01', priority: 'Low' });
    repo.add(task);

    const result = repo.delete(task.id);

    expect(result).toBe(true);
    expect(repo.loadAll()).toHaveLength(0);
  });

  /**
   * TC-16
   * Requirement: FR3
   * Objective: Verify that deleting a non-existent task returns false
   * Preconditions: Repository is empty
   * Steps: Call repo.delete('nonexistent-id')
   * Expected: Returns false
   */
  test('TC-16: should return false when deleting a non-existent task', () => {
    const result = repo.delete('nonexistent-id');
    expect(result).toBe(false);
  });
});

// ─── FR4: Get All Tasks ───────────────────────────────────────────────────────

describe('FR4 - Display list of all tasks', () => {
  /**
   * TC-17
   * Requirement: FR4
   * Objective: Verify that getAll() returns all stored tasks
   * Preconditions: Two tasks exist in the repository
   * Steps: Add two tasks, then call repo.getAll()
   * Expected: Returns array of 2 tasks
   */
  test('TC-17: should return all tasks from storage', () => {
    repo.add(Task.create({ title: 'Task 1', deadline: '2026-06-01', priority: 'High' }));
    repo.add(Task.create({ title: 'Task 2', deadline: '2026-06-02', priority: 'Low' }));

    const tasks = repo.getAll();

    expect(tasks).toHaveLength(2);
  });
});
