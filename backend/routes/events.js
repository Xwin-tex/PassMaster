const router = require('express').Router();
const eventController = require('../controllers/eventController');
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, eventController.list);
router.get('/:id', eventController.getById);

router.post('/', authenticate, authorize('admin', 'organizer'), eventController.create);
router.put('/:id', authenticate, authorize('admin', 'organizer'), eventController.update);

router.get('/:id/tickets', authenticate, eventController.getTickets);

module.exports = router;
