const express = require('express');
const { check } = require('express-validator');

const apiController = require('../controllers/api-controllers');
const fileUpload = require('../middleware/file-upload');
const imageUpload = require('../middleware/image-upload');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

router.get('/getevent/:link', apiController.getEvent);

router.post('/eventcreate', checkAuth, apiController.createEvent);

router.post('/meetingconfirm', checkAuth, apiController.meetingConfirm);

router.get('/getuserevents', checkAuth, apiController.getUserEvents);

router.get('/getusermeetings', checkAuth, apiController.getUserMeetings);

router.get('/getevents', checkAuth, apiController.getEvents);

router.get('/getmeetings', checkAuth, apiController.getMeetings);

router.delete('/eventdelete/:id', checkAuth, apiController.eventDelete);

router.delete('/meetingdelete/:id', checkAuth, apiController.meetingDelete);

router.post('/eventupdate', checkAuth, apiController.eventUpdate);

router.post(
    '/createclient',
    checkAuth,
    imageUpload.single('image'),
    [
      check('fullname')
        .not()
        .isEmpty(),
      check('email')
        .normalizeEmail()
        .isEmail(),
      check('email').isLength({ min: 5 }),
    ],
    apiController.createClient
);

router.delete('/clientdelete/:id', checkAuth, apiController.clientDelete);

router.get('/getclients', checkAuth, apiController.getClients);

router.get('/getclient/:id', checkAuth, apiController.getClient);

router.post(
    '/updateclient',
    checkAuth,
    imageUpload.single('image'),
    [
      check('fullname')
        .not()
        .isEmpty(),
      check('email')
        .normalizeEmail()
        .isEmail(),
      check('email').isLength({ min: 5 }),
    ],
    apiController.clientUpdate
);

router.post(
  '/convert',
  checkAuth,
  fileUpload.single('file'),
  apiController.convertFile
);

router.post('/createcontract', checkAuth, apiController.createContract);

router.get('/getcontract/:id', apiController.getContract);

router.post('/signcontract', apiController.signContract);

router.get('/downloadcontract/:id', apiController.downloadContract);

router.get('/getcontracts', checkAuth, apiController.getContracts);

router.get('/getcontractscounts', checkAuth, apiController.getContractsCounts);

router.get('/getinvoices', checkAuth, apiController.getInvoices);

router.post(
  '/updateaccount',
  checkAuth,
  imageUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty()
  ],
  apiController.updateAccount
);

router.get('/getinvoice/:id', apiController.getInvoice);

router.get('/downloadinvoice/:id', apiController.downloadInvoice);

router.get('/getuserstatsdashboard', checkAuth, apiController.getUserStatsDashboard);

module.exports = router;
