const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/users', authenticate, authorize('admin'), adminController.listUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), adminController.updateUserRole);

module.exports = router;
