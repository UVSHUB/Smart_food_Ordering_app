const Review = require('../models/Review');
const Food = require('../models/Food');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { food_id, rating, comment } = req.body;

    // Check Range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if Food exists
    const food = await Food.findById(food_id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Check for existing review explicitly (Duplicate constraint handles this but good for custom error message)
    const alreadyReviewed = await Review.findOne({
      user_id: req.user._id,
      food_id: food_id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    const review = new Review({
      user_id: req.user._id,
      food_id,
      rating: Number(rating),
      comment,
    });

    await review.save();
    res.status(201).json({ success: true, message: 'Review added', review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }
    next(error);
  }
};

// @desc    Get all reviews for a food item
// @route   GET /api/reviews/food/:foodId
// @access  Public
const getFoodReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ food_id: req.params.foodId })
      .populate('user_id', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user_id: req.params.userId })
      .populate('food_id', 'name image price')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure authorized user
    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this review' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = Number(rating);
    }
    
    if (comment) {
      review.comment = comment;
    }

    await review.save(); // triggers calcAverageRatings
    res.json({ success: true, message: 'Review updated', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure authorized user OR admin
    if (review.user_id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findOneAndDelete({ _id: req.params.id }); // triggers post-findOneAndDelete hook
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getFoodReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};
