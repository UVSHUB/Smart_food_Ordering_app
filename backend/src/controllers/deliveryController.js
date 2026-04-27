const Delivery = require('../models/Delivery');

// @desc    Create a new delivery
// @route   POST /api/deliveries
// @access  Admin
const createDelivery = async (req, res, next) => {
  try {
    const { order_id, user_id, address, phone, status } = req.body;

    if (!order_id || !user_id || !address || !phone) {
      res.status(400);
      throw new Error('order_id, user_id, address, and phone are required');
    }

    const delivery = await Delivery.create({
      order_id,
      user_id,
      address,
      phone,
      status: status || 'Pending',
    });

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Admin
const getAllDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single delivery by ID
// @route   GET /api/deliveries/:id
// @access  Public
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      res.status(404);
      throw new Error('Delivery not found');
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all deliveries for a specific user
// @route   GET /api/deliveries/user/:userId
// @access  Public
const getUserDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({ user_id: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery (status, address, phone)
// @route   PUT /api/deliveries/:id
// @access  Admin
const updateDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      res.status(404);
      throw new Error('Delivery not found');
    }

    const { status, address, phone } = req.body;

    // Enforce valid status transitions (optional guard)
    const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
    if (status && !validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (status !== undefined) delivery.status = status;
    if (address !== undefined) delivery.address = address;
    if (phone !== undefined) delivery.phone = phone;

    const updated = await delivery.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a delivery
// @route   DELETE /api/deliveries/:id
// @access  Admin
const deleteDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      res.status(404);
      throw new Error('Delivery not found');
    }

    await delivery.deleteOne();
    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  getUserDeliveries,
  updateDelivery,
  deleteDelivery,
};
