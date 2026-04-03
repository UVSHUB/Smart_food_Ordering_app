const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Import Route Handlers (We will build these next)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const path = require('path');

const app = express();

// Global Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json()); // Allows parsing application/json

// Base Routes API
app.get('/', (req, res) => {
  res.send('Smart Food API is running...');
});

// Mount Specific API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/reviews', reviewRoutes);

// Make the uploads folder publicly accessible statically
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));

// Error Handling Middlewares (Must be defined at the end)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
