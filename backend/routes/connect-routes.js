const express = require('express');
const connectController = require('../controllers/connect-controllers');

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

router.get('/zoom/callback', connectController.zoomCallback);
router.get('/google/callback', connectController.googleCallback);
router.get('/stripe/callback', connectController.stripeCallback);

router.post('/zoom', connectController.connectToZoom);
router.post('/google', connectController.connectToGoogleCalendar);
router.post('/stripe', connectController.connectToStripe);
router.post('/calendar/freedays', connectController.getGoogleFreeTimes);

router.get('/check/:service/:userId', checkAuth, connectController.checkServiceConnection);

router.post('/zoom/remove', checkAuth, connectController.removeZoomMeeting);
router.post('/zoom/reschedule', checkAuth, connectController.rescheduleZoomMeeting);

router.post('/stripe/createinvoice', checkAuth, connectController.createInvoice);
router.post('/stripe/resendinvoice', checkAuth, connectController.resendInvoice);

router.post('/payinvoice/:id', connectController.payInvoice);

router.get('/getstripestats', checkAuth, connectController.getStripeStats);

router.post('/deletesocial', checkAuth, connectController.deleteSocial)

module.exports = router;
