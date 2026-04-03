const express = require('express');
const { getUserProfile, updateUserProfile, updateUserById, deleteUserById } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/:id')
  .put(protect, updateUserById)
  .delete(protect, deleteUserById);

module.exports = router;
