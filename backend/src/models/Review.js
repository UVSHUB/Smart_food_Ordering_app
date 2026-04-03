const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    food_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Food',
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews: One review per user per food item
reviewSchema.index({ food_id: 1, user_id: 1 }, { unique: true });

// Static method to calculate average rating and number of reviews
reviewSchema.statics.calcAverageRatings = async function (foodId) {
  const stats = await this.aggregate([
    {
      $match: { food_id: foodId },
    },
    {
      $group: {
        _id: '$food_id',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await mongoose.model('Food').findByIdAndUpdate(foodId, {
      numReviews: stats.length > 0 ? stats[0].nRating : 0,
      rating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    });
  } catch (err) {
    console.error('Error calculating average ratings:', err);
  }
};

// Call calcAverageRatings after save operations
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.food_id);
});

// Call calcAverageRatings after remove/delete operations
// In Mongoose >= 6, Model.findOneAndDelete triggers 'findOneAndDelete' middleware.
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.food_id);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
