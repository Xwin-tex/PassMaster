const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');

router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);
router.post('/webhook', require('express').raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
