const express = require('express');
const { getUserProfile, updateUserProfile, updateUserById, deleteUserById, getUsers, getUserById } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/')
  .get(protect, admin, getUsers);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUserById)
  .delete(protect, admin, deleteUserById);

module.exports = router;
