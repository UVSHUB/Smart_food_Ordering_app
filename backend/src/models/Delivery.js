const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order_id: {
      type: String, // flexible string reference (matches Payment.js pattern)
      required: [true, 'Order ID is required'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;
