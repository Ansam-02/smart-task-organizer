const fs = require('fs');
const path = require('path');
const Task = require('../models/Task');

/**
 * TaskRepository
 * 
 * Design Patterns Used:
 * 1. Repository Pattern - بيفصل منطق الوصول للبيانات عن منطق الأعمال
 * 2. Singleton Pattern - بيضمن وجود instance واحد بس بيتعامل مع الملف
 */
class TaskRepository {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, '../../data/tasks.json');
    this._ensureFileExists();
  }

  // يتأكد إن الملف موجود، إذا لأ بينشئه
  _ensureFileExists() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  // FR9: تحميل كل المهام من الملف
  loadAll() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.map(item => Task.fromJSON(item));
    } catch (error) {
      console.error('Error loading tasks:', error.message);
      return [];
    }
  }

  // FR8: حفظ كل المهام بالملف
  saveAll(tasks) {
    try {
      const data = tasks.map(task => task.toJSON());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving tasks:', error.message);
      throw new Error('Failed to save tasks.');
    }
  }

  // البحث عن مهمة بالـ ID
  findById(id) {
    const tasks = this.loadAll();
    return tasks.find(task => task.id === id) || null;
  }

  // إضافة مهمة جديدة
  add(task) {
    const tasks = this.loadAll();
    tasks.push(task);
    this.saveAll(tasks);
    return task;
  }

  // تحديث مهمة موجودة
  update(id, updatedTask) {
    const tasks = this.loadAll();
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return null;

    tasks[index] = updatedTask;
    this.saveAll(tasks);
    return updatedTask;
  }

  // حذف مهمة
  delete(id) {
    const tasks = this.loadAll();
    const filtered = tasks.filter(task => task.id !== id);
    
    if (filtered.length === tasks.length) return false;

    this.saveAll(filtered);
    return true;
  }

  // FR4: عرض كل المهام
  getAll() {
    return this.loadAll();
  }
}

// Singleton instance
let instance = null;

function getRepository(filePath) {
  if (!instance) {
    instance = new TaskRepository(filePath);
  }
  return instance;
}

// للاختبار: إعادة تعيين الـ singleton
function resetRepository() {
  instance = null;
}

module.exports = { TaskRepository, getRepository, resetRepository };