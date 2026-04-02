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
  .post(protect, admin, upload.single('image'), createFood);

router
  .route('/:id')
  .get(getFoodById)
  .put(protect, admin, upload.single('image'), updateFood)
  .delete(protect, admin, deleteFood);

module.exports = router;
