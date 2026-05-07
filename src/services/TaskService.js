const Task = require('../models/Task');
const fs = require('fs');

/**
 * TaskService
 * Design Pattern: Service Layer Pattern
 * بيفصل منطق الأعمال عن طبقة البيانات (Repository) وطبقة العرض (Controller)
 */
class TaskService {
  constructor(repository) {
    this.repository = repository;
  }

  // FR1: إنشاء مهمة جديدة
  createTask(data) {
    const task = Task.create(data);
    return this.repository.add(task);
  }

  // FR2: تعديل مهمة موجودة
  editTask(id, updates) {
    const task = this.repository.findById(id);
    if (!task) {
      throw new Error(`Task with ID '${id}' not found.`);
    }
    task.update(updates);
    return this.repository.update(id, task);
  }

  // FR3: حذف مهمة
  deleteTask(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Task with ID '${id}' not found.`);
    }
    return true;
  }

  // FR4: عرض كل المهام
  getAllTasks() {
    return this.repository.getAll();
  }

  // FR6: تعليم المهمة كمكتملة
  markAsCompleted(id) {
    const task = this.repository.findById(id);
    if (!task) {
      throw new Error(`Task with ID '${id}' not found.`);
    }
    task.markAsCompleted();
    return this.repository.update(id, task);
  }

  // FR6: فرز المهام (حسب deadline أو priority)
  getSortedTasks(sortBy, order = 'asc') {
    const tasks = this.repository.getAll();
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'deadline') {
        comparison = new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === 'priority') {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        throw new Error(`Invalid sort field: '${sortBy}'. Use 'deadline' or 'priority'.`);
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  // FR7: فلترة المهام
  getFilteredTasks(filterBy) {
    const tasks = this.repository.getAll();

    switch (filterBy) {
      case 'completed':
        return tasks.filter(t => t.status === 'Completed');
      case 'not-completed':
        return tasks.filter(t => t.status !== 'Completed');
      case 'high-priority':
        return tasks.filter(t => t.priority === 'High');
      default:
        throw new Error(`Invalid filter: '${filterBy}'. Use 'completed', 'not-completed', or 'high-priority'.`);
    }
  }

  // FR10: تصدير المهام لملف نصي
  exportToTextFile(filePath) {
    const tasks = this.repository.getAll();
    
    if (tasks.length === 0) {
      throw new Error('No tasks to export.');
    }

    const lines = [
      '========================================',
      '       SMART TASK ORGANIZER - EXPORT',
      `       Date: ${new Date().toLocaleDateString()}`,
      '========================================',
      '',
    ];

    tasks.forEach((task, index) => {
      lines.push(`--- Task ${index + 1} ---`);
      lines.push(`  Title:       ${task.title}`);
      lines.push(`  Description: ${task.description || 'N/A'}`);
      lines.push(`  Deadline:    ${task.deadline}`);
      lines.push(`  Priority:    ${task.priority}`);
      lines.push(`  Status:      ${task.status}`);
      lines.push(`  Created:     ${task.createdAt}`);
      lines.push(`  Updated:     ${task.updatedAt}`);
      lines.push('');
    });

    lines.push(`Total Tasks: ${tasks.length}`);
    lines.push('========================================');

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return filePath;
  }
}

module.exports = TaskService;