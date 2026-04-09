const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  getUserPayments,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');

// GET /api/payments/user/:userId   → must come BEFORE /:id so it doesn't clash
router.get('/user/:userId', getUserPayments);

router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
