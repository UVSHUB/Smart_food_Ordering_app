const express = require('express');
const router = express.Router();
const {
  createReview,
  getFoodReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createReview);

router.route('/food/:foodId')
  .get(getFoodReviews);

router.route('/user/:userId')
  .get(getUserReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
