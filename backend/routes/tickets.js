const router = require('express').Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/mine', authenticate, ticketController.myTickets);
router.post('/purchase', authenticate, ticketController.purchase);

router.get('/validate/:code', authenticate, ticketController.validate);
router.post('/checkin', authenticate, authorize('admin', 'staff', 'organizer'), ticketController.checkIn);

router.get('/event/:eventId', authenticate, authorize('admin', 'organizer', 'staff'), ticketController.eventTickets);

module.exports = router;
