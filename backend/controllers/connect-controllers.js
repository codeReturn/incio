const axios = require('axios');
const User = require('../models/user');
const Meeting = require('../models/meeting');
const Invoice = require('../models/invoice');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');

const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const qs = require('qs');
const Papa = require('papaparse');

const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  host: "mail.san-company.com",
  port: 465,
  secure: true, 
  auth: {
    user: "demo@san-company.com",
    pass: "@Morph123", 
  },
});

const getZoomAuthUrl = (userId) => {
  const redirectUri = 'http://localhost:5000/server/api/connect/zoom/callback';
  const state = userId;
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
  return authUrl;
};

const getGoogleAuthUrl = (userId) => {
  const redirectUri = 'http://localhost:5000/server/api/connect/google/callback';
  const scope = 'https://www.googleapis.com/auth/calendar.events';
  const state = userId;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  return authUrl;
};

const getStripeAuthUrl = (userId) => {
  const redirectUri = 'http://localhost:5000/server/api/connect/stripe/callback';
  const state = userId;
  const authUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${redirectUri}&state=${state}`;
  return authUrl;
};

const connectToZoom = async (req, res, next) => {
  const { userId } = req.body;

  const authUrl = getZoomAuthUrl(userId);
  res.json({ authUrl, userId });
};

const connectToGoogleCalendar = async (req, res, next) => {
  const { userId } = req.body;

  const authUrl = getGoogleAuthUrl(userId);
  res.json({ authUrl, userId });
};

const connectToStripe = async (req, res, next) => {
  const { userId } = req.body;

  const authUrl = getStripeAuthUrl(userId);
  res.json({ authUrl, userId });
};

const zoomCallback = async (req, res, next) => {
  const { code, state } = req.query;
  const userId = state.split('?userId=')[1];

  try {
    const { data } = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:5000/server/api/connect/zoom/callback',
        client_id: process.env.ZOOM_CLIENT_ID,
        client_secret: process.env.ZOOM_CLIENT_SECRET,
      },
    });

    const { access_token, refresh_token } = data;

    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found.');
        return res.status(404).send('User not found.');
      }

      let zoomSocial = user.socials.find(social => social.platform === 'zoom');
      if (!zoomSocial) {
        zoomSocial = {
          platform: 'zoom',
          accessToken: access_token,
          refreshToken: refresh_token,
        };
        user.socials.push(zoomSocial);
      } else {
        zoomSocial.accessToken = access_token;
        zoomSocial.refreshToken = refresh_token;
      }

      const updatedUser = await user.save();
      console.log('Zoom access token and refresh token updated successfully.');
      res.send('<script>window.close();</script>');
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Error updating user.');
    }
  } catch (error) {
    console.error('Error connecting to Zoom:', error);
    res.status(500).send('Error connecting to Zoom.');
  }
};

const googleCallback = async (req, res, next) => {
  const { code, state } = req.query;
  const userId = state.split('?userId=')[1];

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:5000/server/api/connect/google/callback',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      },
    });

    const { access_token, refresh_token } = data;

    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found.');
        return res.status(404).send('User not found.');
      }

      let googleSocial = user.socials.find(social => social.platform === 'google');
      if (!googleSocial) {
        googleSocial = {
          platform: 'google',
          accessToken: access_token,
          refreshToken: refresh_token,
        };
        user.socials.push(googleSocial);
      } else {
        googleSocial.accessToken = access_token;
        googleSocial.refreshToken = refresh_token;
      }

      const updatedUser = await user.save();
      console.log('Google access token and refresh token updated successfully.');
      res.send('<script>window.close();</script>');
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Error updating user.');
    }
  } catch (error) {
    console.error('Error connecting to Google:', error);
    res.status(500).send('Error connecting to Google.');
  }
};

const stripeCallback = async (req, res, next) => {
  const { code, state } = req.query;
  const userId = state.split('?userId=')[1];

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
      client_secret: process.env.STRIPE_SECRET_KEY,
    });

    const { access_token, refresh_token, stripe_user_id, stripe_publishable_key } = response;

    console.log(response)
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found.');
        return res.status(404).send('User not found.');
      }
    
      let stripeSocial = user.socials.find(social => social.platform === 'stripe');
      if (!stripeSocial) {
        stripeSocial = {
          platform: 'stripe',
          accessToken: access_token,
          refreshToken: refresh_token,
          accountId: stripe_user_id, 
          publishableKey: stripe_publishable_key
        };
        user.socials.push(stripeSocial);
      } else {
        stripeSocial.accessToken = access_token;
        stripeSocial.refreshToken = refresh_token;
        stripeSocial.accountId = stripe_user_id; 
        stripeSocial.publishableKey = stripe_publishable_key;
      }
    
      const updatedUser = await user.save();
      console.log('Stripe access token and refresh token updated successfully.');
      res.send('<script>window.close();</script>');
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Error updating user.');
    }
  } catch (error) {
    console.error('Error connecting to Stripe:', error);
    res.status(500).send('Error connecting to Stripe.');
  }
};

const getGoogleFreeTimes = async (req, res, next) => {
  const { date, author } = req.body;

  let user;
  try {
    user = await User.findById(author, '-password');
  } catch (err) {
    const error = new HttpError('Error while fetching user!', 500);
    return next(error);
  }

  let googleSocial = user.socials.find((social) => social.platform === 'google');

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: googleSocial.accessToken,
      refresh_token: googleSocial.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items;

    const busyTimes = extractBusyTimes(events);
    const freeTimes = generateFreeTimes(busyTimes);

    res.json(freeTimes);
  } catch (error) {
    if (error.code === 401) {
      // Access token expired, refresh it
      auth.refreshAccessToken(function (err, tokens) {
        if (err) {
          console.error('Error refreshing access token:', err);
          res.status(500).json({ error: 'Error refreshing access token.' });
        } else {
          // Save the new tokens in your user model
          googleSocial.accessToken = tokens.access_token;
          googleSocial.refreshToken = tokens.refresh_token;
          user.save();
          // Call the function again with new tokens
          getGoogleFreeTimes(req, res, next);
        }
      });
    } else {
      console.error('Error retrieving free times from Google Calendar:', error);
      res.status(500).json({ error: 'An error occurred while retrieving free times.' });
    }
  }
};


const extractBusyTimes = (events) => {
  return events.map((event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    return { start, end };
  });
};

const generateFreeTimes = (busyTimes) => {
  const dayStart = new Date();
  dayStart.setHours(8, 0, 0, 0);

  const dayEnd = new Date();
  dayEnd.setHours(20, 0, 0, 0);

  const freeTimes = [];

  let currentStart = dayStart;
  for (const busyTime of busyTimes) {
    if (currentStart < busyTime.start) {
      const currentEnd = busyTime.start;
      const timeSlots = getTimeSlots(currentStart, currentEnd);
      freeTimes.push(...timeSlots);
    }
    currentStart = busyTime.end;
  }

  if (currentStart < dayEnd && currentStart.getTime() !== dayEnd.getTime()) {
    const timeSlots = getTimeSlots(currentStart, dayEnd);
    freeTimes.push(...timeSlots);
  }

  return freeTimes;
};

const getTimeSlots = (start, end) => {
  const timeSlots = [];
  let currentTime = new Date(start);
  while (currentTime < end) {
    const slotEnd = new Date(currentTime.getTime() + 60 * 60000);
    if (slotEnd <= end) {
      timeSlots.push({
        date: currentTime.toISOString(),
        start: formatTime(currentTime),
        end: formatTime(slotEnd),
      });
    }
    currentTime = new Date(slotEnd);
  }
  return timeSlots;
};

const formatTime = (time) => {
  const formattedTime = new Date(time).toLocaleTimeString([], {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  return formattedTime;
};

const refreshZoomToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found.');
      return;
    }

    let zoomSocial = user.socials.find((social) => social.platform === 'zoom');
    if (!zoomSocial) {
      console.error('User does not have Zoom connected.');
      return;
    }

    const refreshResponse = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: zoomSocial.refreshToken,
        client_id: process.env.ZOOM_CLIENT_ID,
        client_secret: process.env.ZOOM_CLIENT_SECRET,
      },
    });

    const { access_token } = refreshResponse.data;

    // Update the access token in the user's social data
    zoomSocial.accessToken = access_token;
    await user.save();

    console.log('Zoom access token refreshed successfully.');
  } catch (error) {
    console.error('Error refreshing Zoom access token:', error);
  }
};

const removeZoomMeeting = async (req, res, next) => {
  const { meetingId, dbId } = req.body;

  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      console.error('User not found.');
      return res.status(404).send('User not found.');
    }

    const meeting = await Meeting.findById(dbId);
    if (!meeting) {
      console.error('Meeting not found.');
      return res.status(404).send('Meeting not found.');
    }

    let zoomSocial = user.socials.find(social => social.platform === 'zoom');
    if (!zoomSocial) {
      console.error('User does not have Zoom connected.');
      return res.status(400).send('User does not have Zoom connected.');
    }

    // Check if the access token has expired
    const { accessToken, refreshToken } = zoomSocial;
    const tokenExpiration = jwt.decode(accessToken).exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenExpiration < currentTime) {
      // Access token expired, refresh it
      await refreshZoomToken(req.userData.userId);
    }

    // Make the request to remove the Zoom meeting using the updated access token
    try {
      const response = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${zoomSocial.accessToken}`
        }
      });

      if (response.data) {
        await meeting.updateOne({ $unset: { selected_time: 1 } });
      }

      res.status(200).json({ message: 'global_success' });
    } catch (deleteError) {
      console.error('Error removing Zoom meeting:', deleteError);
      res.status(500).send('Error removing Zoom meeting.');
    }
  } catch (err) {
    console.error('Error removing Zoom meeting:', err);
    res.status(500).send('Error removing Zoom meeting.');
  }
};

const rescheduleZoomMeeting = async (req, res, next) => {
  const { meetingId, newDateTime, newEndTime, dbId } = req.body;

  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      console.error('User not found.');
      return res.status(404).send('User not found.');
    }

    const zoomSocial = user.socials.find((social) => social.platform === 'zoom');
    if (!zoomSocial) {
      console.error('User does not have Zoom connected.');
      return res.status(400).send('User does not have Zoom connected.');
    }

    // Check if the access token has expired
    const { accessToken, refreshToken } = zoomSocial;
    const tokenExpiration = jwt.decode(accessToken).exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenExpiration < currentTime) {
      // Access token expired, refresh it
      await refreshZoomToken(req.userData.userId);
    }

    // Make the request to reschedule the Zoom meeting using the updated access token
    try {
      const startDate = new Date(newDateTime);
      const endDate = new Date(newEndTime);

      // Calculate the duration in minutes
      const duration = Math.round((endDate - startDate) / (1000 * 60));

      await axios.patch(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        {
          start_time: startDate.toISOString(),
          duration,
        },
        {
          headers: {
            Authorization: `Bearer ${zoomSocial.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Retrieve the updated meeting details to get the join URL
      const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${zoomSocial.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Update the selected_time object in MongoDB
      const meeting = await Meeting.findById(dbId);
      if (!meeting) {
        console.error('Meeting not found.');
        return res.status(404).send('Meeting not found.');
      }

      const { start_url, join_url } = response.data;

      meeting.selected_time = {
        date: newDateTime,
        start: moment(startDate).format('h:mm A'),
        end: moment(endDate).format('h:mm A'),
        zoomEventId: meetingId,
        zoomMeetingLink: join_url || start_url,
      };

      await meeting.save();

      res.status(200).json({ message: 'global_success' });
    } catch (err) {
      console.error('Error rescheduling Zoom meeting:', err);

      if (err.response && err.response.data && err.response.data.errors) {
        // Zoom API validation errors
        const zoomErrors = err.response.data.errors;
        return res.status(400).json({ message: 'Validation failed', errors: zoomErrors });
      }

      res.status(500).send('Error rescheduling Zoom meeting.');
    }
  } catch (err) {
    console.error('Error rescheduling Zoom meeting:', err);
    res.status(500).send('Error rescheduling Zoom meeting.');
  }
};

const refreshStripeToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found.');
      return;
    }

    let stripeSocial = user.socials.find((social) => social.platform === 'stripe');
    if (!stripeSocial) {
      console.error('User does not have Stripe connected.');
      return;
    }

    const refreshResponse = await stripe.oauth.token({
      grant_type: 'refresh_token',
      refresh_token: stripeSocial.refreshToken,
      client_secret: process.env.STRIPE_SECRET_KEY,
    });
    
    const { access_token } = refreshResponse;

    // Update the access token in the user's social data
    stripeSocial.accessToken = access_token;
    await user.save();

    console.log('Stripe access token refreshed successfully.');
  } catch (error) {
    console.error('Error refreshing Stripe access token:', error);
  }
};

const checkServiceConnection = async (req, res, next) => {
  const { service, userId } = req.params;

  // Validate service and userId
  if (!service || !userId) {
    return res.status(400).send({ error: 'Service and user id are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    const serviceData = user.socials.find(social => social.platform === service);

    // if the user has connected to the service, it will return true, otherwise false
    res.json({ isConnected: !!serviceData });
  } catch (err) {
    console.error(`Error checking service connection:`, err);
    res.status(500).send({ error: 'An error occurred while checking the service connection.' });
  }
};

const handleStripeError = async (error, userId) => {
  if (error.code === 'token_expired') {
    await refreshStripeToken(userId);

    throw new Error('Token refreshed. Retry operation.');
  }

  throw error;
}

const stripeForUser = (accessToken) => {
  const stripe = require('stripe')(accessToken);
  return stripe;
};

const isTokenExpired = (accessToken) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return accessToken.expiryTimestamp <= currentTime;
};


const createInvoice = async (req, res, next) => {
  const { invoicename, invoicedescription, invoicestatement, name, date, email, companyName, address, country, zip, service, items, payment } = req.body;

  const timestamp = Math.floor(new Date(date).getTime() / 1000);

  // Check if date is in the future
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (timestamp <= currentTimestamp) {
    return res.status(400).json({ error: 'Date must be in the future' });
  }

  const user = await User.findById(req.userData.userId);
  if (!user) {
    console.error('User not found.');
    return res.status(404).send('User not found.');
  }

  // Filter for the Stripe access token
  const stripeSocial = user.socials.find(social => social.platform === 'stripe');
  if (!stripeSocial) {
    console.error('Stripe access token not found.');
    return res.status(404).send('Stripe access token not found.');
  }

  if (isTokenExpired(stripeSocial.accessToken)) { // Implement isTokenExpired function
    // Refresh the access token
    await refreshStripeToken(req.userData.userId);

    // Retrieve the user again to get the updated access token
    user = await User.findById(req.userData.userId);
    stripeSocial = user.socials.find(social => social.platform === 'stripe');
  }


  const userStripe = stripeForUser(stripeSocial.accessToken);

  let invoice;
  let dbcurrency;
  try {
    if (service === "stripe") {
      let customer;
      try {
        customer = await userStripe.customers.create({
          email: email,
          name: name,
          address: {
            line1: address,
            city: '',
            state: '',
            postal_code: zip,
            country: country.value,
          },
        });
      } catch (error) {
        await handleStripeError(error, req.userData.userId);
        console.error('Error creating customer:', error);
        throw error;
      }

      // Fetch the account details to determine the default currency
      let account;
      try {
        account = await userStripe.accounts.retrieve();
      } catch (error) {
        await handleStripeError(error, req.userData.userId);
        console.error('Error retrieving account:', error);
        throw error;
      }

      // Retrieve the default currency from the account object
      const defaultCurrency = account.default_currency;

      try {
        const isChargeAutomatically = payment === 'auto';
      
        invoice = await userStripe.invoices.create({
          customer: customer.id,
          collection_method: isChargeAutomatically ? 'charge_automatically' : 'send_invoice',
          ...(isChargeAutomatically ? {} : { due_date: timestamp }),
          custom_fields: [
            { name: 'Company Name', value: companyName }
          ],
          statement_descriptor: invoicestatement,
        });
      } catch (error) {
        await handleStripeError(error, req.userData.userId);
        console.error('Error creating invoice:', error);
        throw error;
      }
      
      

      // Create invoice items
      for (let item of items) {
        try {
          const totalAmount = item.price * item.qty * 100; // total amount = price * quantity
          await userStripe.invoiceItems.create({
            customer: customer.id,
            invoice: invoice.id,
            currency: defaultCurrency,
            amount: totalAmount,
            description: item.name,
          });
        } catch (error) {
          await handleStripeError(error, req.userData.userId);
          console.error('Error creating invoice item:', error);
          throw error;
        }
      }

      try {
        await userStripe.invoices.finalizeInvoice(invoice.id);
      } catch (error) {
        await handleStripeError(error, req.userData.userId);
        console.error('Error finalizing invoice:', error);
        throw error;
      }

      dbcurrency = defaultCurrency;
    }

    // Save the invoice details to your database
    const newInvoice = new Invoice({
      invoicename,
      invoicedescription,
      invoicestatement,
      name,
      date,
      email,
      companyName,
      address,
      country,
      zip,
      items,
      payment,
      author: req.userData.userId,
      invoice_id: invoice?.id,
      status: service ? 1 : 0,
      currency: dbcurrency
    });
    await newInvoice.save();

    let mailOptions = {
      from: '"Incio" <demo@san-company.com>',
      to: email,
      subject: `New invoice created: ${invoicename}`,
      text: `A new invoices has been created for ${email}.\n\n${invoicedescription} \n Link: https://incio.io/invoice/${newInvoice._id}`
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'global_success', invoiceId: invoice?.id });
  } catch (error) {
    if (error.message === 'Token refreshed. Retry operation.') {
      return createInvoice(req, res, next);
    }

    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Error creating invoice' });
  }
};


const resendInvoice = async (req, res, next) => {
  const { invoiceId } = req.body;

  try {
    // Retrieve the invoice from your database
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      console.error('Invoice not found.');
      return res.status(404).send('Invoice not found.');
    }

    if (invoice.author.toString() !== req.userData.userId) {
      const error = new HttpError('You dont have access', 401);
      return next(error);
    }

    const user = await User.findById(invoice.author);
    if (!user) {
      console.error('User not found.');
      return res.status(404).send('User not found.');
    }
  
    // Filter for the Stripe access token
    const stripeSocial = user.socials.find(social => social.platform === 'stripe');
    if (!stripeSocial) {
      console.error('Stripe access token not found.');
      return res.status(404).send('Stripe access token not found.');
    }

    if (isTokenExpired(stripeSocial.accessToken)) { // Implement isTokenExpired function
      // Refresh the access token
      await refreshStripeToken(req.userData.userId);
  
      // Retrieve the user again to get the updated access token
      user = await User.findById(req.userData.userId);
      stripeSocial = user.socials.find(social => social.platform === 'stripe');
    }
  
    const userStripe = stripeForUser(stripeSocial.accessToken);
  

    try {
      updatedInvoice = await userStripe.invoices.sendInvoice(invoice.invoice_id);
    } catch (error) {
      await handleStripeError(error, req.userData.userId);
    }


    // Return the success response to the client
    res.status(200).json({ message: 'global_success', invoiceId: updatedInvoice.id });
  } catch (error) {
    if (error.message === 'Token refreshed. Retry operation.') {
      return resendInvoice(req, res, next);
    }

    console.error('Error resending invoice:', error);
    res.status(500).json({ error: 'Error resending invoice' });
  }
};

const payInvoice = async (req, res, next) => {
  const { id: invoiceId } = req.params;
  const { paymentMethodId, receipt_email, stripeInvoiceId } = req.body;

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 2) {
      return res.status(400).json({ message: 'Invoice has already been paid' });
    }

    const user = await User.findById(invoice.author);
    if (!user) {
      console.error('User not found.');
      return res.status(404).send('User not found.');
    }

    const stripeSocial = user.socials.find((social) => social.platform === 'stripe');
    if (!stripeSocial) {
      console.error('Stripe access token not found.');
      return res.status(404).send('Stripe access token not found.');
    }

    if (isTokenExpired(stripeSocial.accessToken)) { // Implement isTokenExpired function
      // Refresh the access token
      await refreshStripeToken(req.userData.userId);
  
      // Retrieve the user again to get the updated access token
      user = await User.findById(req.userData.userId);
      stripeSocial = user.socials.find(social => social.platform === 'stripe');
    }

    const userStripe = stripeForUser(stripeSocial.accessToken);

    if (stripeInvoiceId) {
      const stripeInvoice = await userStripe.invoices.retrieve(stripeInvoiceId);
    
      if (stripeInvoice.status === 'paid') {
        invoice.status = 2;
        await invoice.save();
        return res.status(200).json({ message: 'Invoice is already paid' });
      }
    
      const customerId = stripeInvoice.customer;
    
      // Attach the payment method to the customer's Stripe account
      await userStripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    
      // Set the payment method as the default payment method for the customer's invoice settings
      await userStripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    
      // Pay the Stripe invoice using the default payment method
      await userStripe.invoices.pay(stripeInvoiceId);
    
      invoice.status = 2;
      await invoice.save();
    
      return res.status(200).json({ message: 'Payment successful' });
    }    

    const totalAmount = invoice.items.reduce((total, item) => total + item.qty * item.price, 0);

    const paymentIntent = await userStripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: invoice.currency,
      payment_method: paymentMethodId,
      receipt_email: receipt_email,
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      invoice.status = 2;
      invoice.paymentIntentId = paymentIntent.id;
      await invoice.save();

      return res.status(200).json({ message: 'Payment successful', clientSecret: paymentIntent.client_secret });
    } else {
      return res.status(400).json({ message: 'Payment failed. Please try again.' });
    }
  } catch (error) {
    console.error('Error paying invoice:', error);
    res.status(500).json({ message: 'Error paying invoice' });
  }
};

const getStripeStats = async (req, res, next) => {
  try {
    const { timeRange, startDate, endDate } = req.query;

    // Retrieve the user's access token for Stripe from the database
    let user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeSocial = user.socials.find((social) => social.platform === 'stripe');
    if (!stripeSocial) {
      console.error('Stripe access token not found.');
      return res.status(404).send('Stripe access token not found.');
    }

    if (isTokenExpired(stripeSocial.accessToken)) {
      // Refresh the access token
      await refreshStripeToken(req.userData.userId);

      // Retrieve the user again to get the updated access token
      user = await User.findById(req.userData.userId);
      stripeSocial = user.socials.find((social) => social.platform === 'stripe');
    }

    // Generate the report run
    const intervalStart = moment(startDate).unix();
    const intervalEnd = moment(endDate).unix();

    const reportRunResponse = await axios.post(
      'https://api.stripe.com/v1/reporting/report_runs',
      qs.stringify({
        report_type: 'balance_change_from_activity.itemized.3',
        parameters: {
          interval_start: intervalStart,
          interval_end: intervalEnd,
          columns: ['created', 'reporting_category', 'net', 'gross'],
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${stripeSocial.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const reportRunId = reportRunResponse.data.id;

    // Poll the status of the report run
    let reportRun;
    do {
      reportRun = await axios.get(`https://api.stripe.com/v1/reporting/report_runs/${reportRunId}`, {
        headers: {
          Authorization: `Bearer ${stripeSocial.accessToken}`,
        },
      });

      if (reportRun.data.status === 'failed') {
        console.error('Report run failed:', reportRun.data);
        return res.status(500).json({ error: 'Report run failed' });
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    } while (reportRun.data.status === 'pending');

    // Retrieve the report file URL
    const fileId = reportRun.data.result.id;
    const fileUrl = `https://files.stripe.com/v1/files/${fileId}/contents`;

    // Fetch the report file contents
    const reportFile = await axios.get(fileUrl, {
      headers: {
        Authorization: `Bearer ${stripeSocial.accessToken}`,
      },
    });

    const parsedData = Papa.parse(reportFile.data, { header: true }).data;

    const nonEmptyRows = parsedData.filter((entry) => entry.created !== '' && moment(entry.created).year() >= 2020);

    const grossVolume = nonEmptyRows.map((entry) => parseFloat(entry.gross));
    const netVolume = nonEmptyRows.map((entry) => parseFloat(entry.net));
    const labels = nonEmptyRows.map((entry) => moment(entry.created).format('YYYY-MM-DD'));

    res.json({ labels, grossVolume, netVolume });
  } catch (error) {
    console.error(error.response.data.error);
    let message = 'Internal Server Error';
    if (error.response) {
      message = `Error from Stripe API: ${error.response.data.error.message}`;
    } else if (error.request) {
      message = 'No response received from Stripe API';
    }
    res.status(500).json({ error: message, details: error.message });
  }
};

const deleteSocial = async (req, res, next) => {
  const { platform } = req.body;
  const userId = req.userData.userId;

  try {
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { socials: { platform } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'global_success' });
    } else {
      res.status(404).json({ message: 'Object not found.' });
    }
  } catch (error) {
    console.error('Error deleting social object:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  connectToZoom,
  connectToGoogleCalendar,
  connectToStripe,
  zoomCallback,
  googleCallback,
  stripeCallback,
  getGoogleFreeTimes,
  removeZoomMeeting,
  rescheduleZoomMeeting,
  checkServiceConnection,
  refreshStripeToken,
  createInvoice,
  resendInvoice,
  payInvoice,
  getStripeStats,
  deleteSocial
};