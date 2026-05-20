const path = require('path');

/**
 * TaskController
 * Design Pattern: MVC (Controller)
 * بتعامل مع HTTP req/res فقط، وبتفوّض المنطق للـ Service
 */
class TaskController {
  constructor(taskService) {
    this.taskService = taskService;
  }

  // POST /tasks — FR1
  createTask = (req, res) => {
    try {
      const task = this.taskService.createTask(req.body);
      res.status(201).json({ success: true, data: task.toJSON() });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  // GET /tasks — FR4 + FR6 (sort) + FR7 (filter)
  getAllTasks = (req, res) => {
    try {
      const { sortBy, order, filter } = req.query;
      let tasks;

      if (filter) {
        tasks = this.taskService.getFilteredTasks(filter);
      } else if (sortBy) {
        tasks = this.taskService.getSortedTasks(sortBy, order);
      } else {
        tasks = this.taskService.getAllTasks();
      }

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks.map(t => t.toJSON()),
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  // GET /tasks/:id
  getTaskById = (req, res) => {
    try {
      const tasks = this.taskService.getAllTasks();
      const task = tasks.find(t => t.id === req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      res.status(200).json({ success: true, data: task.toJSON() });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // PUT /tasks/:id — FR2
  editTask = (req, res) => {
    try {
      const task = this.taskService.editTask(req.params.id, req.body);
      res.status(200).json({ success: true, data: task.toJSON() });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // DELETE /tasks/:id — FR3
  deleteTask = (req, res) => {
    try {
      this.taskService.deleteTask(req.params.id);
      res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // PATCH /tasks/:id/complete — FR6
  markAsCompleted = (req, res) => {
    try {
      const task = this.taskService.markAsCompleted(req.params.id);
      res.status(200).json({ success: true, data: task.toJSON() });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // GET /tasks/export — FR10
  exportTasks = (req, res) => {
    try {
      const exportPath = path.join(__dirname, '../../data/tasks_export.txt');
      this.taskService.exportToTextFile(exportPath);
      res.download(exportPath, 'tasks_export.txt');
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
}

module.exports = TaskController;