const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  getUserDeliveries,
  updateDelivery,
  deleteDelivery,
} = require('../controllers/deliveryController');

// GET /api/deliveries/user/:userId  → must come BEFORE /:id so it doesn't clash
router.get('/user/:userId', getUserDeliveries);

router.post('/', createDelivery);
router.get('/', getAllDeliveries);
router.get('/:id', getDeliveryById);
router.put('/:id', updateDelivery);
router.delete('/:id', deleteDelivery);

module.exports = router;
