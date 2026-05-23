const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profileController');

const authenticate = require('../middleware/auth');

const roleMiddleware = require('../middleware/role');

// USER
router.get(
  '/user/profile',
  authenticate,
  roleMiddleware('USER'),
  profileController.getUserProfile
);

router.put(
  '/user/profile',
  authenticate,
  roleMiddleware('USER'),
  profileController.updateUserProfile
);

// ADMIN
router.get(
  '/admin/profile',
  authenticate,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  profileController.getAdminProfile
);

router.put(
  '/admin/profile',
  authenticate,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  profileController.updateAdminProfile
);

module.exports = router;