const express = require('express');

/**
 * REST API Endpoints:
 * 
 * POST   /api/tasks              → إنشاء مهمة (FR1)
 * GET    /api/tasks              → كل المهام (FR4) + sort/filter (FR6, FR7)
 * GET    /api/tasks/export       → تصدير لملف نصي (FR10)
 * GET    /api/tasks/:id          → مهمة محددة
 * PUT    /api/tasks/:id          → تعديل (FR2)
 * DELETE /api/tasks/:id          → حذف (FR3)
 * PATCH  /api/tasks/:id/complete → تعليم كمكتملة (FR6)
 */
function createTaskRoutes(taskController) {
  const router = express.Router();

  // export لازم يكون قبل /:id عشان ما يعتبر كلمة "export" كـ ID
  router.get('/export', taskController.exportTasks);

  router.post('/', taskController.createTask);
  router.get('/', taskController.getAllTasks);
  router.get('/:id', taskController.getTaskById);
  router.put('/:id', taskController.editTask);
  router.delete('/:id', taskController.deleteTask);
  router.patch('/:id/complete', taskController.markAsCompleted);

  return router;
}

module.exports = createTaskRoutes;