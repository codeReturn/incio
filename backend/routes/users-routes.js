const express = require('express');
const { check } = require('express-validator');
const passport = require('passport');

const usersController = require('../controllers/users-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post(
  '/signup',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google'), usersController.socialLogin);

router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback', passport.authenticate('linkedin'), usersController.socialLogin);

router.post('/getuserinfopublic', usersController.getUserInfoPublic);

router.get('/getuserinfo', checkAuth, usersController.getUserInfo);

router.post('/sendotp', checkAuth, usersController.sendOtp);

router.post('/verifyotp', checkAuth, usersController.verifyOtp);

router.post('/updateabout', checkAuth, usersController.updateAbout);

router.get('/alltimezones', usersController.allTimezones);

router.post('/updatetimezone', usersController.updateTimeZone);

module.exports = router;