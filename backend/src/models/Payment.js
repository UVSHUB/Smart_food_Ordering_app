const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order_id: {
      type: String, // flexible - can reference order module later
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'],
    },
    payment_method: {
      type: String,
      enum: ['Cash', 'Card', 'Online'],
      default: 'Cash',
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
