// Import necessary modules
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

// Function to create the Express server
const createServer = () => {
  const app = express();

  // Middleware to parse JSON
  app.use(express.json());

  // Use routes for the respective paths
  app.use('/rooms', roomRoutes);
  app.use('/messages', messageRoutes);

  // Optional: 404 handler
  // app.use((req, res) => {
  //   res.status(404).json({ message: 'Route not found' });
  // });

  // Optional: Error handler
  // app.use((err, req, res, next) => {
  //   console.error(err.stack);
  //   res.status(500).json({ message: 'Internal server error' });
  // });

  return app;
};

// Export the createServer function
export { createServer };
