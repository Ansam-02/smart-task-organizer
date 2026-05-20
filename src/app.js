const express = require('express');
const { getRepository } = require('./repositories/TaskRepository');
const TaskService = require('./services/TaskService');
const TaskController = require('./controllers/TaskController');
const createTaskRoutes = require('./routes/taskRoutes');

// --- Dependency Injection: ربط كل الطبقات ببعضها ---
const repository = getRepository();
const taskService = new TaskService(repository);
const taskController = new TaskController(taskService);

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/tasks', createTaskRoutes(taskController));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Smart Task Organizer API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// FR8: حفظ تلقائي عند الإغلاق
process.on('SIGINT', () => {
  console.log('\nSaving tasks before exit...');
  const tasks = repository.getAll();
  repository.saveAll(tasks);
  console.log(`${tasks.length} tasks saved. Goodbye!`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  const tasks = repository.getAll();
  repository.saveAll(tasks);
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // FR9: تحميل تلقائي
    const tasks = repository.getAll();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Loaded ${tasks.length} tasks from storage.`);
  });
}

module.exports = app;