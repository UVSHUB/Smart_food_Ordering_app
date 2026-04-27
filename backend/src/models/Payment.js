const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order_id: {
      type: String,
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
    order_status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Delivered'],
      default: 'Pending',
    },
    // Delivery details captured at checkout
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    // Snapshot of ordered items
    items: [
      {
        name:  { type: String },
        price: { type: Number },
        qty:   { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
