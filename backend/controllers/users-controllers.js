const fs = require('fs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Event = require('../models/event');

const otpGenerator = require('otp-generator');
const twilio = require('twilio');

const moment = require('moment-timezone');

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('We got an error!', 422)
    );
  }

  const { email, password, redirect } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching user!',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'Email address already exist!',
      500
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Error while hashing password!',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
    type: 'default'
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'We got error while saving user!',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.SECRET,
      { expiresIn: 3600000 }
    );
  } catch (err) {
    const error = new HttpError(
      'Error while creating a profile!',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token, redirect });
};

const login = async (req, res, next) => {
  const { email, password, rememberme, redirect } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again!',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Logging in failed, please try again!',
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
        'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    if(!rememberme){
        token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.SECRET,
          { expiresIn: 3600000 }
        );
    } else {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.SECRET,
        { expiresIn: 31536000000 }
      );
    }

  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    rememberme: rememberme,
    redirect
  });
};

const socialLogin = async (req, res, next) => {
  const { email } = req.user;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  if (existingUser) {
    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.SECRET,
        { expiresIn: 3600000 }
      );
    } catch (err) {
      const error = new HttpError('Logging in failed, please try again later.', 500);
      return next(error);
    }

    return res.redirect(`https://incio.io/loginsocial?autologin=on&socialuserid=${existingUser.id}&socialtoken=${token}`);
  }

  const { name } = req.user;
  const createdUser = new User({
    name,
    email
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.SECRET,
      { expiresIn: 3600000 }
    );
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  res.redirect(`https://incio.io/loginsocial?autologin=on&socialuserid=${existingUser.id}&socialtoken=${token}`);
};

const getUserInfo = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userId, '-password')
  } catch (err) {
    const error = new HttpError(
      'Error while fetching user!',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user })
}

const getUserInfoPublic = async (req, res, next) => {
  const { link } = req.body;

  let event;
  try {
    event = await Event.findOne({ 'uniquelink': link })
  } catch (err) {
    const error = new HttpError('Error while fetching user!', 500);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(event.author, '-password');
  } catch (err) {
    const error = new HttpError('Error while fetching user!', 500);
    return next(error);
  }

  res.status(200).json({ user });
};


const sendOtp = async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    const error = new HttpError('Enter phone number!', 500);
    return next(error);
  }

  const twilioPhoneNumber = '+15736334879';
  const otpCode = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const client = require('twilio')(process.env.TWILIOSID, process.env.TWILIOAUTHTOKEN);

  client.messages
    .create({
      body: `incio OTP code is: ${otpCode}`,
      from: twilioPhoneNumber,
      to: phone,
    })
    .then(() => {
      User.findOneAndUpdate(
        { _id: req.userData.userId },
        { otp_code: otpCode },
        { new: true }
      )
        .then((user) => {
          res.json({ success: true, message: 'OTP sent successfully' });
        })
        .catch((error) => {
          console.log(error)
          res.status(500).json({ success: false, message: 'Error updating OTP code' });
        });
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({ success: false, message: 'Error sending OTP via SMS' });
    });
};

const verifyOtp = async (req, res, next) => {
  const { code } = req.body;

  let user;
  try {
    user = await User.findById(req.userData.userId, '-password')
  } catch (err) {
    const error = new HttpError(
      'Error while fetching user!',
      500
    );
    return next(error);
  }

  let status;
  if(user.otp_code === code) {

    try {
      await User.findOneAndUpdate(
        { _id: req.userData.userId },
        { verified: true },
        { new: true }
      )

      status = true

    } catch (err) {
      status = false

      const error = new HttpError(
        'Error while updating user status!',
        500
      );
      return next(error); 
    }

  } else {
    status = false

    const error = new HttpError(
      'OTP code is not correct!',
      500
    );
    return next(error);
  }

  res.status(200).json({ status: status })
}

const updateAbout = async (req, res, next) => {
  const { name, company, members } = req.body;

  let user;
  try {
    user = await User.findById(req.userData.userId, '-password')
  } catch (err) {
    const error = new HttpError(
      'Error while fetching user!',
      500
    );
    return next(error);
  }

  if(!user){
    const error = new HttpError(
      'Error finding user!',
      500
    );
    return next(error);
  }

  if(!name || !company || !members) {
    const error = new HttpError(
      'All fields are required!',
      500
    );
    return next(error);
  }

  try {
    const filter = { _id: req.userData.userId };
    const update = { name: name, company: company, members: members };

    await User.findOneAndUpdate(filter, update);
  } catch (err) {
      console.log(err)
      const error = new HttpError(
          "Error while updating about informations!",
          500
      );
      return next(error);
  }

  res.status(200).json({ message: 'global_success' });
}

const allTimezones = async (req, res, next) => {
  const timezones = moment.tz.names();
  res.json(timezones);
}

const updateTimeZone = async (req, res) => {
  const { userId, timezone } = req.body;

  console.log('Received request to update timezone:', userId, timezone);

  try {
    await User.findByIdAndUpdate(userId, { timezone }, { new: true });
    console.log('Timezone updated successfully');
  } catch (err) {
    console.error('Failed to update timezone:', err);
    res.status(500).json({ error: 'Failed to update timezone preference' });
    return; 
  }

  res.status(200).json({ message: 'global_success' });
};


exports.signup = signup;
exports.login = login;
exports.socialLogin = socialLogin;
exports.getUserInfo = getUserInfo;
exports.getUserInfoPublic = getUserInfoPublic;
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
exports.updateAbout = updateAbout;
exports.allTimezones = allTimezones;
exports.updateTimeZone = updateTimeZone;