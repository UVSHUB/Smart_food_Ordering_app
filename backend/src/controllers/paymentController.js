const Payment = require('../models/Payment');

// ── POST /api/payments ──────────────────────────────────────
// Create a new payment
const createPayment = async (req, res) => {
  try {
    const { user_id, order_id, amount, payment_method } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ message: 'user_id and amount are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }

    const payment = new Payment({
      user_id,
      order_id: order_id || '',
      amount,
      payment_method: payment_method || 'Cash',
      status: 'Pending',
    });

    const saved = await payment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/payments ───────────────────────────────────────
// Get all payments (admin)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/payments/:id ───────────────────────────────────
// Get single payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('user_id', 'name email');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/payments/user/:userId ──────────────────────────
// Get all payments for a specific user (payment history)
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/payments/:id ───────────────────────────────────
// Update payment status or method
const updatePayment = async (req, res) => {
  try {
    const { status, payment_method } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (status) payment.status = status;
    if (payment_method) payment.payment_method = payment_method;

    const updated = await payment.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/payments/:id ────────────────────────────────
// Delete payment record (admin)
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }
    await payment.deleteOne();
    res.json({ message: 'Payment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getUserPayments,
  updatePayment,
  deletePayment,
};
