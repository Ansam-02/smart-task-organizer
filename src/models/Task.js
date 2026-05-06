const { v4: uuidv4 } = require('uuid');

/**
 * Task Model
 * Design Pattern: Factory Pattern
 * Why: مركزة منطق إنشاء المهام، التحقق من البيانات، 
 * وضمان القيم الافتراضية في مكان واحد.
 */
class Task {
  constructor({ id, title, description, deadline, priority, status, createdAt, updatedAt }) {
    this.id = id || uuidv4();
    this.title = title;
    this.description = description || '';
    this.deadline = deadline;
    this.priority = priority; // 'High', 'Medium', 'Low'
    this.status = status || 'ToDo'; // FR5
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Factory method - ينشئ مهمة جديدة مع التحقق
  static create(data) {
    const { title, description, deadline, priority } = data;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Title is required and must be a non-empty string.');
    }

    if (!deadline) {
      throw new Error('Deadline is required.');
    }

    const validPriorities = ['High', 'Medium', 'Low'];
    if (!priority || !validPriorities.includes(priority)) {
      throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
    }

    return new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      deadline,
      priority,
    });
  }

  static fromJSON(json) {
    return new Task(json);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      deadline: this.deadline,
      priority: this.priority,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // FR6
  markAsCompleted() {
    this.status = 'Completed';
    this.updatedAt = new Date().toISOString();
  }

  // FR2
  update(updates) {
    const allowedFields = ['title', 'description', 'deadline', 'priority'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'priority') {
          const validPriorities = ['High', 'Medium', 'Low'];
          if (!validPriorities.includes(updates[field])) {
            throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
          }
        }
        if (field === 'title' && (!updates[field] || updates[field].trim() === '')) {
          throw new Error('Title cannot be empty.');
        }
        this[field] = typeof updates[field] === 'string' ? updates[field].trim() : updates[field];
      }
    }
    
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Task;