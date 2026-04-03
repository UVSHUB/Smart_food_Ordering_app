const express = require('express');
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getFoods)
  .post(upload.single('image'), createFood);

router
  .route('/:id')
  .get(getFoodById)
  .put(upload.single('image'), updateFood)
  .delete(deleteFood);

module.exports = router;
