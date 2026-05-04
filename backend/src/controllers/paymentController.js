const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');

// ── POST /api/payments ──────────────────────────────────────
// Create a new payment AND auto-create a linked Delivery record
const createPayment = async (req, res) => {
  try {
    let { user_id, order_id, amount, payment_method, address, phone, items } = req.body;

    // Handle items if it's sent as a JSON string (typical for multipart/form-data)
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid items format.' });
      }
    }

    if (!user_id || !amount) {
      return res.status(400).json({ message: 'user_id and amount are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }
    if (!address || !address.trim() || address.trim().length < 5) {
      return res.status(400).json({ message: 'A valid delivery address (at least 5 chars) is required.' });
    }
    if (!phone || !phone.trim() || !/^(0\d{9})$/.test(phone.trim())) {
      return res.status(400).json({ message: 'A valid 10-digit phone number is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (payment_method === 'Online' && !req.file) {
      return res.status(400).json({ message: 'Payment proof is required for online transfers.' });
    }


    // 1. Create the payment record
    const payment = new Payment({
      user_id,
      order_id: order_id || '',
      amount,
      payment_method: payment_method || 'Cash',
      status: 'Pending',
      order_status: 'Pending',
      address: address.trim(),
      phone: phone.trim(),
      items: items || [],
      payment_proof: req.file ? `/uploads/${req.file.filename}` : '',
    });


    const savedPayment = await payment.save();

    // 2. Auto-create a linked Delivery record
    const delivery = new Delivery({
      order_id: savedPayment._id.toString(), // use payment._id as the order reference
      user_id,
      address: address.trim(),
      phone: phone.trim(),
      status: 'Pending',
    });

    const savedDelivery = await delivery.save();

    // 3. Update the payment with the delivery's order_id reference
    savedPayment.order_id = savedPayment._id.toString();
    await savedPayment.save();

    res.status(201).json({
      success: true,
      payment: savedPayment,
      delivery: savedDelivery,
    });
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
    const { status, payment_method, order_status } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (status) payment.status = status;
    if (payment_method) payment.payment_method = payment_method;
    if (order_status) payment.order_status = order_status;

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

// ── PUT /api/payments/:id/cancel ─────────────────────────────
// Cancel payment/order
const cancelPayment = async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (payment.order_status === 'Cancelled') {
      return res.status(400).json({ message: 'Payment is already cancelled.' });
    }

    payment.order_status = 'Cancelled';
    payment.status = 'Cancelled';
    payment.cancellation_reason = cancellation_reason || 'Cancelled by user';
    const updated = await payment.save();

    // Cancel associated delivery
    const delivery = await Delivery.findOne({ order_id: payment._id.toString() });
    if (delivery) {
      delivery.status = 'Cancelled';
      await delivery.save();
    }

    res.json(updated);
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
  cancelPayment,
  deletePayment,
};
