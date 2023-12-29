const fs = require('fs');
const path = require('path');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Event = require('../models/event');
const Meeting = require('../models/meeting');
const Client = require('../models/client');
const Contract = require('../models/contract');
const Invoice = require('../models/invoice');
const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require('moment');
const momenttz = require('moment-timezone');
const paginate = require('jw-paginate');
const puppeteer = require('puppeteer');

const pdfjsLib = require('pdfjs-dist');

moment.tz.setDefault('UTC');

let transporter = nodemailer.createTransport({
  host: "mail.san-company.com",
  port: 465,
  secure: true, 
  auth: {
    user: "demo@san-company.com",
    pass: "@Morph123", 
  },
});

const createEvent = async (req, res, next) => {
  const { name, description, location, locationaddress, eventcalendar, eventdate, eventavailable, eventduration, questions, uniquelink, scheduletimes } = req.body.event;

  try {
    // Retrieve the user document
    const user = await User.findById(req.userData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the unique link already exists
    const existingEvent = await Event.findOne({ uniquelink });
    if (existingEvent) {
      throw new Error('Unique link already exists');
    }

    const event = new Event({
      name: name,
      description: description,
      location: location,
      locationaddress: locationaddress,
      eventcalendar: eventcalendar,
      eventdate: eventdate,
      eventavailable: eventavailable,
      eventduration: eventduration,
      questions: questions,
      author: req.userData.userId,
      uniquelink: uniquelink,
      scheduletimes: scheduletimes
    });

    try {
      await event.save();
    } catch (err) {
      const error = new HttpError(
        'Error while saving event!',
        500
      );
      return next(error);
    }

    res.status(201).json({ message: 'global_success' });
  } catch (error) {
    console.log(error)
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

const refreshZoomToken = async (refreshToken, author) => {
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    if (response.data) {
      const { access_token, refresh_token } = response.data;

      let user = await User.findById(author, '-password');
      
      if (!user) {
        console.error('No user found with this ID:', author);
        throw new Error('No user found with this ID:' + author);
      }
    
      let zoomSocial = user.socials.find((social) => social.platform === 'zoom');
      zoomSocial.accessToken = access_token;
      zoomSocial.refreshToken = refresh_token;
      await user.save();

      return access_token;
    }
  } catch (error) {
    console.error('Failed to refresh Zoom token:', error);
    throw error;
  }
};

const createZoomEvent = async (accessToken, refreshToken, event) => {
  try {
    const { name, email, questions = [], selected_time } = event;

    console.log(event)

    const timeZone = moment.tz.guess();

    const startDate = moment(selected_time.date).tz(timeZone);
    const startTime = moment(selected_time.start, 'hh:mm A').tz(timeZone);
    const endTime = moment(selected_time.end, 'hh:mm A').tz(timeZone);

    const requestData = {
      topic: name,
      type: 2, // Scheduled meeting
      start_time: startDate.clone().set({ hour: startTime.hour(), minute: startTime.minute() }).format(),
      duration: endTime.diff(startTime, 'minutes'),
      timezone: timeZone,
      settings: {
        host_video: true,
        participant_video: false,
        join_before_host: true,
        waiting_room: false,
        approval_type: 0,
        registration_type: 2,
        registrants_email_notification: false,
        registrants: [{ email }]
      },
    };

    if (questions.length > 0) {
      requestData.settings.custom_questions = questions.map((question) => ({
        title: question.field_description,
        value: question.answer
      }));
    }

    let response;
    try {
      response = await axios.post(`https://api.zoom.us/v2/users/me/meetings`, requestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      if (error.response && error.response.status === 401) { 
        accessToken = await refreshZoomToken(refreshToken, event.author);
        response = await axios.post(`https://api.zoom.us/v2/users/me/meetings`, requestData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        throw error;
      }
    }

    if (response.status === 201) {
      const { id, join_url } = response.data;
      const meetingResult = {
        ...selected_time, 
        zoomEventId: id, 
        zoomMeetingLink: join_url
      };
      return [meetingResult];
    }

    return [];

  } catch (error) {
    console.error('Failed to create event on Zoom:', error);
    throw error;
  }
};

const createGoogleCalendarEvent = async (accessToken, event) => {
  try {
    const { name, description, emails, questions, scheduletimes } = event;
    const timeZone = moment.tz.guess();

    for (const schedule of scheduletimes) {
      const startDate = moment(schedule.date, 'DD/MM/YYYY').tz(timeZone);
      const startTime = moment(schedule.schedule_times[0].start, 'hh:mm A').tz(timeZone);
      const endTime = moment(schedule.schedule_times[0].end, 'hh:mm A').tz(timeZone);

      const requestData = {
        summary: name,
        description: description,
        start: {
          dateTime: startDate.clone().set({ hour: startTime.hour(), minute: startTime.minute() }).format(),
          timeZone: timeZone,
        },
        end: {
          dateTime: startDate.clone().set({ hour: endTime.hour(), minute: endTime.minute() }).format(),
          timeZone: timeZone,
        },
        attendees: emails.map((email) => ({ email: email.value })),
      };

      // Add questions
      requestData.description += '\n\nQuestions:\n';
      questions.forEach((question, index) => {
        requestData.description += `${index + 1}. ${question.field_description}\n`;
      });

      console.log('Google Calendar request data:', requestData);

      const response = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', requestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Google Calendar response:', response.data);
    }
  } catch (error) {
    console.error('Failed to create event on Google Calendar:', error);
    throw new Error('Failed to create event on Google Calendar');
  }
};

const getUserEvents = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ _id: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Error while searching user!',
      500
    );
    return next(error);
  }

  if(!user) {
    const error = new HttpError(
      'User dont exist!',
      500
    );
    return next(error);
  }

  let events;
  try {
    events = await Event.find({ author: req.userData.userId })
  } catch (err) {
    const error = new HttpError(
      'Error while fetching events!',
      500
    );
    return next(error);
  }

  res.status(200).json({ events: events })
}

const getUserMeetings = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ _id: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Error while searching user!',
      500
    );
    return next(error);
  }

  if(!user) {
    const error = new HttpError(
      'User dont exist!',
      500
    );
    return next(error);
  }

  let meetings;
  try {
    meetings = await Meeting.find({ eventauthor: req.userData.userId })
  } catch (err) {
    const error = new HttpError(
      'Error while fetching meetings!',
      500
    );
    return next(error);
  }

  res.status(200).json({ meetings: meetings })
}

const getEvent = async (req, res, next) => {
  const link = req.params.link;

  let event;
  try {
    event = await Event.findOne({ 'uniquelink': link });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching event!',
      500
    );
    return next(error);
  }

  if (!event) {
    const error = new HttpError(
      'Event dont exist!',
      404
    );
    return next(error);
  }

  res.json({ event: event.toObject({ getters: true }) });
}

const meetingConfirm = async (req, res, next) => {
  const { name, email, message, quests, questions, date, selected_time, link, eventauthor } = req.body.meeting;

  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const event = await Event.findOne({ uniquelink: link });
    if (!event) {
      throw new Error('Event does not exist!');
    }

    const eventAuthor = await User.findById(eventauthor);
    if (!eventAuthor) {
      throw new Error('Event author does not exist!');
    }

    // const existingMeeting = await Meeting.findOne({ email: email, link: link });
    // if (existingMeeting) {
      // throw new Error('You have already confirmed a meeting!');
    // }

    let selectedTime = null;
    if (event.location === 'zoom') {
      selectedTime = {
        date: date,
        start: selected_time.start,
        end: selected_time.end
      };

      const { accessToken, refreshToken } = eventAuthor.socials.find((social) => social.platform === 'zoom');
      const zoomMeeting = {
        name: name,
        description: message,
        emails: [email],
        questions: questions,
        selected_time: selectedTime,
        author: eventAuthor
      };

      const meetingResults = await createZoomEvent(accessToken, refreshToken, zoomMeeting);
      if (meetingResults.length > 0) {
        selectedTime.zoomEventId = meetingResults[0].zoomEventId;
        selectedTime.zoomMeetingLink = meetingResults[0].zoomMeetingLink;
      }
    } else {
      selectedTime = {
        date: date,
        start: selected_time.start,
        end: selected_time.end,
        zoomEventId: null,
        zoomMeetingLink: null
      };
    }

    const meeting = new Meeting({
      name: name,
      email: email,
      message: message,
      questions: questions,
      quests: quests,
      date: date,
      selected_time: selectedTime,
      link: link,
      eventauthor: eventauthor
    });

    try {
      await meeting.save();

      // Send email to the event author
      let authorMailOptions = {
        from: '"Incio" <demo@san-company.com>',
        to: eventAuthor.email,
        subject: `New meeting confirmed: ${meeting.name}`,
        text: `A new meeting has been confirmed with ${meeting.email}.\n\n${meeting.message}`
      };

      // Send email to the attendee
      let attendeeMailOptions = {
        from: '"Incio" <demo@san-company.com>',
        to: email,
        subject: `Meeting confirmed with Incio: ${meeting.name}`,
        text: `Your meeting with Incio has been confirmed.\n\n${meeting.message}`
      };

      // If the meeting is on Zoom, include the Zoom links in the emails
      if (event.location === 'zoom') {
        authorMailOptions.text += `\n\nZoom link:\nStart: ${selectedTime.start}, End: ${selectedTime.end}, Link: ${selectedTime.zoomMeetingLink}`;
        attendeeMailOptions.text += `\n\nZoom link:\nStart: ${selectedTime.start}, End: ${selectedTime.end}, Link: ${selectedTime.zoomMeetingLink}`;
      }

      // Send the emails
      transporter.sendMail(authorMailOptions);
      transporter.sendMail(attendeeMailOptions);
    } catch (err) {
      console.log(err);
      const error = new HttpError('Error while saving meeting!', 500);
      return next(error);
    }

    res.status(201).json({ message: 'global_success', event: event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};


const getEvents = async (req, res, next) => {
  let events;
  try {
    events = await Event.find({ "author": req.userData.userId }).sort({ _id: -1 });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching events!',
      500
    );
    return next(error);
  }
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const pager = paginate(events.length, page, pageSize);

  const pageOfItems = await Promise.all(events.slice(pager.startIndex, pager.endIndex + 1).map(async (event) => {
    const eventObject = event.toObject({ getters: true });

    const meetingsCount = await Meeting.countDocuments({ link: eventObject.uniquelink });

    const meetingsWithLink = await Meeting.find({ link: eventObject.uniquelink });
    const questsCountsPromises = meetingsWithLink.map(async (meeting) => {
      if (meeting.quests) {
        return meeting.quests.length;
      }
      return 0;
    });
    const questsCounts = await Promise.all(questsCountsPromises);
    const questsCount = questsCounts.reduce((total, count) => total + count, 0);

    return {
      ...eventObject,
      meetingsCount,
      questsCount
    };
  }));

  return res.json({ pager, pageOfItems });
}

const getMeetings = async (req, res, next) => {
  let meetings;
  try {
    meetings = await Meeting.find({ "eventauthor": req.userData.userId }).sort({ _id: -1 });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching meetings!',
      500
    );
    return next(error);
  }
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const pager = paginate(meetings.length, page, pageSize);

  const pageOfItems = await Promise.all(meetings.slice(pager.startIndex, pager.endIndex + 1).map(async (meeting) => {
    const meetingObject = meeting.toObject({ getters: true });

    const event = await Event.findOne({ uniquelink: meetingObject.link });

    return {
      ...meetingObject,
      event
    };
  }));

  return res.json({ pager, pageOfItems });
}

const eventDelete = async (req, res, next) => {
  const id = req.params.id;

  let event;
  try {
    event = await Event.findById(id);
  } catch (err) {
    const error = new HttpError(
      'Error while fetching events!',
      500
    );
    return next(error);
  }

  if(!event) {
    const error = new HttpError(
      'Event dont exist!',
      500
    );
    return next(error);
  }

  if (event.author.toString() !== req.userData.userId) {
    const error = new HttpError('You dont have access', 401);
    return next(error);
  }

  try {
    await event.remove();
  } catch (err){
    const error = new HttpError(
      'Error while deleting event!',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'global_success' });
}

const meetingDelete = async (req, res, next) => {
  const id = req.params.id;

  let meeting;
  try {
    meeting = await Meeting.findById(id);
  } catch (err) {
    const error = new HttpError(
      'Error while fetching meeting!',
      500
    );
    return next(error);
  }

  if(!meeting) {
    const error = new HttpError(
      'Meeting dont exist!',
      500
    );
    return next(error);
  }

  if (meeting.eventauthor.toString() !== req.userData.userId) {
    const error = new HttpError('You dont have access', 401);
    return next(error);
  }

  try {
    await meeting.remove();
  } catch (err){
    const error = new HttpError(
      'Error while deleting meeting!',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'global_success' });
}

const eventUpdate = async (req, res, next) => { 
    const { id, name, description, location, eventdate, eventavailable, eventduration, questions, uniquelink, scheduletimes, locationaddress, eventcalendar } = req.body.event;
  
    let user;
    try {
      user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError(
        'Error while fetching user!',
        500
      );
      return next(error);
    }

    if(!user) {
      const error = new HttpError(
        'Error while fetching user!',
        500
      );
      return next(error); 
    }

    const event = await Event.findById(id)
    if(!event){
      const error = new HttpError('Event dont exist', 401);
      return next(error);
    }

    if (event.author.toString() !== req.userData.userId) {
      const error = new HttpError('You dont have access', 401);
      return next(error);
    }
  
    event.name = name;
    event.description = description;
    event.location = location;
    event.eventcalendar = eventcalendar;
    event.eventdate = eventdate;
    event.eventavailable = eventavailable;
    event.eventduration = eventduration;
    event.questions = questions;
    event.scheduletimes = scheduletimes;
    event.locationaddress = locationaddress;
  
    try {
      await event.save();
    } catch (err) {
      const error = new HttpError(
        'Error while saving event update!',
        500
      );
      return next(error);
    }
  
    res.status(200).json({ message: 'global_success' });
}

const createClient = async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    address,
    zip,
    country,
    companyName,
    companyEmail,
    companyPhone,
    companyAddress,
    companyZip,
    companyCountry,
    clientCard,
    clientCardExpires,
    clientCardCCV,
    role,
    active
  } = req.body;

  const parsedCountry = JSON.parse(country);
  const parsedCompanyCountry = JSON.parse(companyCountry);
  const parsedRole = JSON.parse(role);

  const imagePath = req.file ? req.file.path : null;
  const authorId = req.userData.userId;

  try {
    const existingClient = await Client.findOne({ email: email, author: authorId });

    if (existingClient) {
      return res.status(400).json({ message: 'A client with this email already exists.' });
    }

    const client = new Client({
      fullName,
      email,
      phone,
      address,
      zip,
      country: parsedCountry,
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      companyZip,
      companyCountry: parsedCompanyCountry,
      clientCard,
      clientCardExpires,
      clientCardCCV,
      role: parsedRole,
      image: imagePath,
      author: authorId,
      active
    });

    await client.save();

    res.status(201).json({ message: 'global_success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'There was an error while creating the client.' });
  }
};

const clientDelete = async (req, res, next) => {
  const id = req.params.id;

  let client;
  try {
    client = await Client.findById(id);
  } catch (err) {
    const error = new HttpError(
      'Error while fetching client!',
      500
    );
    return next(error);
  }

  if(!client) {
    const error = new HttpError(
      'Client dont exist!',
      500
    );
    return next(error);
  }

  if (client.author.toString() !== req.userData.userId) {
    const error = new HttpError('You dont have access', 401);
    return next(error);
  }

  client.image && fs.unlink(client.image, err => {
    console.log(err);
  }); 

  try {
    await client.remove();
  } catch (err){
    const error = new HttpError(
      'Error while deleting meeting!',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'global_success' });
}

const getClients = async (req, res, next) => {
  const status = req.query.status;

  let query = { "author": req.userData.userId };
  
  if (status === "active") {
    query.active = true;
  } else if (status === "past") {
    query.active = false;
  }
  
  let clients;
  try {
    clients = await Client.find(query).sort({ _id: -1 });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching clients!',
      500
    );
    return next(error);
  }  
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const pager = paginate(clients.length, page, pageSize);
  const pageOfItems = clients.map(client => client.toObject({ getters: true })).slice(pager.startIndex, pager.endIndex + 1);

  return res.json({ pager, pageOfItems });
}

const getClient = async (req, res, next) => {
    const id = req.params.id;
  
    let client;
    try {
      client = await Client.findOne({ '_id': id });
    } catch (err) {
      const error = new HttpError(
        'Error while fetching client!',
        500
      );
      return next(error);
    }
  
    if (!client) {
      const error = new HttpError(
        'Event dont exist!',
        404
      );
      return next(error);
    }

    if (client.author.toString() !== req.userData.userId) {
      const error = new HttpError('You dont have access', 401);
      return next(error);
    }
  
    res.json({ client: client.toObject({ getters: true }) });  
}

const clientUpdate = async (req, res, next) => {
  const {
    id,
    fullName,
    email,
    phone,
    address,
    zip,
    country,
    companyName,
    companyEmail,
    companyPhone,
    companyAddress,
    companyZip,
    companyCountry,
    clientCard,
    clientCardExpires,
    clientCardCCV,
    role,
    active,
    newimage
  } = req.body;

  const parsedCountry = JSON.parse(country);
  const parsedCompanyCountry = JSON.parse(companyCountry);
  const parsedRole = JSON.parse(role);
  const booleannewImage = Boolean(newimage)

  let client;
  try {
    client = await Client.findById(id);
  } catch (err) {
    const error = new HttpError('Error while fetching client!', 500);
    return next(error);
  }

  if (!client) {
    const error = new HttpError('Client does not exist', 401);
    return next(error);
  }

  let imagePath;
  if (booleannewImage === true && req.file) {
    imagePath = req.file.path;
    if (client.image) {
      fs.unlink(client.image, err => {
        if (err) {
          console.log(err);
        }
      });
    }
  } else {
    imagePath = client.image;
  }
  

  client.fullName = fullName;
  client.email = email;
  client.phone = phone;
  client.address = address;
  client.zip = zip;
  client.country = parsedCountry;
  client.companyName = companyName;
  client.companyEmail = companyEmail;
  client.companyPhone = companyPhone;
  client.companyAddress = companyAddress;
  client.companyZip = companyZip;
  client.companyCountry = parsedCompanyCountry;
  client.clientCard = clientCard;
  client.clientCardExpires = clientCardExpires;
  client.clientCardCCV = clientCardCCV;
  client.role = parsedRole;
  client.active = active;
  client.image = imagePath;

  try {
    await client.save();
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Error while saving client update!',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'global_success' });
}

const convertFile = async (req, res, next) => {
  const filePath = req.file.path;
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument({ data });

  try {
    const pdfDocument = await loadingTask.promise;
    let html = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; ++pageNum) {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = await page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();

      let fontSizes = textContent.items.map(
        item =>
          Math.sqrt(
            item.transform[0] * item.transform[0] +
              item.transform[1] * item.transform[1]
          )
      );
      const maxFontSize = Math.max(...fontSizes);

      let lastY, paragraph = '', fontSize, isFirstLine = true;
      let pageHtml = '';

      for (let item of textContent.items) {
        const newFontSize = Math.sqrt(
          item.transform[0] * item.transform[0] +
            item.transform[1] * item.transform[1]
        );
        const yPosition = viewport.height - item.transform[5];
        let itemText = item.str.trim();

        // Remove "Page X" from the beginning of the line
        itemText = itemText.replace(/^Page\s*\d+\s*/i, '');

        const isNewLine = Math.abs(yPosition - lastY) > (newFontSize * 1.5);
        if (isNewLine && paragraph.trim()) {
          const fontWeight = fontSize === maxFontSize ? 'bold' : 'normal';
          if (isFirstLine) {
            // Convert the first line into an h2 heading
            pageHtml += `<h2 style="font-size: ${fontSize}px; font-weight: ${fontWeight};">${paragraph.trim()}</h2>`;
            isFirstLine = false;
          } else {
            pageHtml += `<p style="font-size: ${fontSize}px; font-weight: ${fontWeight};">${paragraph.trim()}</p>`;
          }
          paragraph = '';
        }

        paragraph += (isNewLine ? ' ' : '') + itemText;
        lastY = yPosition;
        fontSize = newFontSize;
      }

      if (paragraph.trim()) {
        const fontWeight = fontSize === maxFontSize ? 'bold' : 'normal';
        pageHtml += `<p style="font-size: ${fontSize}px; font-weight: ${fontWeight};">${paragraph.trim()}</p>`;
      }

      html += `<div style="margin: 40px 0;">${pageHtml}</div>`;
    }

    // Remove "Page X" from the content
    html = html.replace(/Page\s*\d+/g, '');

    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: 'Error parsing PDF file' });
  }
};

const createContract = async (req, res, next) => {
  try {
    const { signature, contractContent, inputs } = req.body.formData;
    const { otherSign, signerEmail, title } = req.body;
    const userId = req.userData.userId;

    if (!contractContent) {
      const error = new HttpError(
        'Contract content is required!',
        500
      );
      return next(error);
    }

    if (!userId) {
      const error = new HttpError(
        'You are not logged in!',
        500
      );
      return next(error);
    }

    const contract = new Contract({
      signature,
      title: title,
      contractContent,
      inputs,
      otherSign,
      signerEmail,
      author: userId
    });

    await contract.save();

    if (otherSign) {
      const contractId = contract._id;
      const emailText = `Please sign the contract at https://incio.io/contract/${contractId}`;
      
      // Create the email options
      const mailOptions = {
        from: '"Incio" <demo@san-company.com>',
        to: signerEmail,
        subject: 'Contract Signature Request',
        text: emailText
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.status(201).json({ message: 'global_success' });
  } catch (error) {
    console.log(error)
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

const getContract = async (req, res, next) => {
  const id = req.params.id;

  let contract;
  try {
    contract = await Contract.findOne({ '_id': id });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching contract!',
      500
    );
    return next(error);
  }

  if (!contract) {
    const error = new HttpError(
      'Contract dont exist!',
      404
    );
    return next(error);
  }

  res.json({ contract: contract.toObject({ getters: true }) });  
}

const signContract = async (req, res, next) => {
  const { id, signature, signer } = req.body;

  console.log(req.body)

  let contract;
  try {
    contract = await Contract.findById(id);
  } catch (err) {
    const error = new HttpError('Error while fetching contract', 500);
    return next(error);
  }

  if (!contract) {
    const error = new HttpError('Contract does not exist', 500);
    return next(error);
  }

  if (contract.otherSign === true && contract.signerEmail !== signer) {
    const error = new HttpError('Invalid signer', 401);
    return next(error);
  }

  try {
    // Update the contract with the signed content
    contract.signedSignature = signature;
    
    const divRegex = /(<div[^>]+className="signer-signature-container"[^>]*>).*?(<\/div>)/g;
    contract.contractContent = contract.contractContent.replace(
      divRegex,
      `$1<img src="${signature}" style="width: 100%; height: auto;" />$2`
    );
    
    contract.status = 1;

    const emailText = `Successfully signed contract on https://incio.io/contract/${id}`;

    // Create the email options
    const mailOptions = {
      from: '"Incio" <demo@san-company.com>',
      to: signer,
      subject: 'Contract Signature Confirmation',
      text: emailText
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Save the updated contract
    await contract.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Error while updating contract', 500);
    return next(error);
  }

  res.status(200).json({ message: 'global_success' });
};


const downloadContract = async (req, res, next) => {
  const id = req.params.id;
  let contract;

  try {
    contract = await Contract.findOne({ '_id': id });
  } catch (err) {
    const error = new HttpError('Error while fetching contract!', 500);
    return next(error);
  }

  if (!contract) {
    const error = new HttpError('Contract does not exist!', 404);
    return next(error);
  }

  const htmlContent = `
  <html>
    <head>
      <style>
        body {
          margin: 40px;
          font-family: Arial, sans-serif;
        }
        .content {
          padding: 20px;
        }
        .signature-image {
          max-height: 200px;
        }
      </style>
    </head>
    <body>
      <div className="content">
        ${contract.contractContent}
      </div>
    </body>
  </html>
  `;


  try {
    const browser = await puppeteer.launch(); 
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(htmlContent);

    // Generate the PDF from the HTML content
    const pdfBuffer = await page.pdf();

    // Close the browser
    await browser.close();

    // Send the PDF file as a download to the client
    res.setHeader('Content-disposition', `attachment; filename=contract_${id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error while generating PDF:', err);
    const error = new HttpError('Error while updating contract', 500);
    return next(error);
  }
};

const getContracts = async (req, res, next) => {
  const status = req.query.status;

  let query = { "author": req.userData.userId };
  
  if (status === "signed") {
    query.status = 1;
  } else if (status === "unsigned") {
    query.active = 0;
  }
  
  let contracts;
  try {
    contracts = await Contract.find(query).sort({ _id: -1 });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching contracts!',
      500
    );
    return next(error);
  }  
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const pager = paginate(contracts.length, page, pageSize);
  const pageOfItems = contracts.map(contract => contract.toObject({ getters: true })).slice(pager.startIndex, pager.endIndex + 1);

  return res.json({ pager, pageOfItems });
}

const getContractsCounts = async (req, res, next) => {
  const userId = req.userData.userId;
  
  try {
    const totalContracts = await Contract.countDocuments({ author: userId });

    const pendingContracts = await Contract.countDocuments({
      author: userId,
      otherSign: true,
      signedSignature: { $exists: false }
    });

    const signedContracts = await Contract.countDocuments({
      author: userId,
      otherSign: true,
      signedSignature: { $exists: true, $ne: '' }
    });

    res.json({
      totalContracts: totalContracts,
      pendingContracts: pendingContracts,
      signedContracts: signedContracts
    });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  const status = req.query.status;

  let query = { "author": req.userData.userId };
  
  if (status === "payed") {
    query.status = 1;
  } else if (status === "pending") {
    query.active = 0;
  }
  
  let invoices;
  try {
    invoices = await Invoice.find(query).sort({ _id: -1 });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching invoices!',
      500
    );
    return next(error);
  }  
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const pager = paginate(invoices.length, page, pageSize);
  const pageOfItems = invoices.map(invoice => invoice.toObject({ getters: true })).slice(pager.startIndex, pager.endIndex + 1);

  return res.json({ pager, pageOfItems });
}

const updateAccount = async (req, res, next) => {
  const {
    name,
    phone,
    address,
    zip,
    country,
    company,
    companyEmail,
    companyPhone,
    companyAddress,
    companyZip,
    companyCountry,
    card,
    cardExpires,
    cardCCV,
    role
  } = req.body;

  const parsedCountry = country && JSON.parse(country);
  const parsedCompanyCountry = companyCountry && JSON.parse(companyCountry);
  const parsedRole = role && JSON.parse(role);

  const imagePath = req.file ? req.file.path : null;
  const authorId = req.userData.userId;

  try {
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== req.userData.userId) {
      return res.status(401).json({ message: 'You don\'t have access' });
    }

    // Update user's account information
    user.name = name;
    user.phone = phone;
    user.address = address;
    user.zip = zip;
    if (parsedCountry) user.country = parsedCountry;
    user.company = company;
    user.companyEmail = companyEmail;
    user.companyPhone = companyPhone;
    user.companyAddress = companyAddress;
    user.companyZip = companyZip;
    if (companyCountry) user.companyCountry = parsedCompanyCountry;
    user.card = card;
    user.cardExpires = cardExpires;
    user.cardCCV = cardCCV;
    if (parsedRole) user.role = parsedRole;
    if (imagePath) user.image = imagePath;

    await user.save();

    res.json({ message: 'global_success' });
  } catch (err) {
    console.error('Error while updating user account:', err);
    res.status(500).json({ message: 'Error while updating user account' });
  }
};

const getInvoice = async (req, res, next) => {
  const id = req.params.id;

  let invoice;
  try {
    invoice = await Invoice.findOne({ '_id': id });
  } catch (err) {
    const error = new HttpError(
      'Error while fetching invoice!',
      500
    );
    return next(error);
  }

  let user;
  try {
    user = await User.findById(invoice.author)
  } catch {
    const error = new HttpError(
      'Error while fetching author!',
      500
    );
    return next(error);
  }

  const stripeSocial = user.socials.find((social) => social.platform === 'stripe');


  if (!invoice) {
    const error = new HttpError(
      'Contract dont exist!',
      404
    );
    return next(error);
  }

  res.json({ invoice: invoice.toObject({ getters: true }), token: stripeSocial.publishableKey });  
}

const downloadInvoice = async (req, res, next) => {
  const id = req.params.id;
  let invoice;

  try {
    invoice = await Invoice.findOne({ '_id': id });
  } catch (err) {
    const error = new HttpError('Error while fetching invoice!', 500);
    return next(error);
  }

  if (!invoice) {
    const error = new HttpError('Invoice does not exist!', 404);
    return next(error);
  }

  const itemsTableRows = invoice.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price.toFixed(2)} <b>${invoice.currency}</td>
    </tr>
  `).join('');

  const totalAmount = invoice.items.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2);

  let statusColor;
  let statusText;

  switch (invoice.status) {
    case 0:
      statusColor = 'gray';
      statusText = 'Default';
      break;
    case 1:
      statusColor = '#FF9500';
      statusText = 'Pending';
      break;
    case 2:
      statusColor = '#30D158';
      statusText = 'Paid';
      break;
    default:
      statusColor = 'black';
      statusText = 'Unknown';
  }

  const htmlContent = `
  <html>
    <head>
      <style>
        body {
          margin: 40px;
          font-family: Arial, sans-serif;
        }
        .content {
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        .signature-image {
          max-height: 200px;
        }
      </style>
    </head>
    <body>
      <div className="content">
        <h2>${invoice.invoicename}</h2>
        <p><strong>Invoice Description:</strong> ${invoice.invoicedescription}</p>
        <p><strong>Invoice Statement:</strong> ${invoice.invoicestatement}</p>
        <p><strong>Name:</strong> ${invoice.name}</p>
        <p><strong>Company:</strong> ${invoice.companyName}</p>
        <p><strong>Address:</strong> ${invoice.address}, ${invoice.zip}, ${invoice.country.label}</p>
        <p><strong>Email:</strong> ${invoice.email}</p>
        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>

        <p><strong>Status:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
        

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
            <tr>
              <td colspan="2">Total:</td>
              <td>${totalAmount} <b>${invoice.currency}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
  `;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(htmlContent);

    // Generate the PDF from the HTML content
    const pdfBuffer = await page.pdf();

    // Close the browser
    await browser.close();

    // Send the PDF file as a download to the client
    res.setHeader('Content-disposition', `attachment; filename=invoice_${id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error while generating PDF:', err);
    const error = new HttpError('Error while updating invoice', 500);
    return next(error);
  }
};

const getUserStatsDashboard = async (req, res, next) => {
  try {
      const userId = req.userData.userId;

      const today = new Date();
      today.setHours(0,0,0,0);

      // Count meetings today for the user
      const meetingsTodayCount = await Meeting.countDocuments({
          eventauthor: userId,
          date: today.toISOString().split('T')[0]
      });

      // Count events today for the user
      const eventsTodayCount = await Event.countDocuments({
          author: userId,
          eventdate: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
      });

      // Count total number of invoices and number of paid invoices for the user
      const totalInvoices = await Invoice.countDocuments({ author: userId });
      const paidInvoices = await Invoice.countDocuments({ author: userId, status: 2 });

      // Count total contracts and pending signatures (status 1) for the user
      const totalContracts = await Contract.countDocuments({ author: userId });
      const pendingSignatures = await Contract.countDocuments({ author: userId, status: 1 });

      // Count total clients and active clients for the user
      const totalClients = await Client.countDocuments({ author: userId });
      const activeClients = await Client.countDocuments({ author: userId, active: true });

      const userEvents = await Event.find({ author: userId }).limit(15);
      const confirmedMeetings = await Meeting.countDocuments({ eventauthor: userId });

      const updatedUserEvents = [];
      
      for (const event of userEvents) {
        const eventLinkId = event.uniquelink;
      
        const meetingsCount = await Meeting.countDocuments({ link: eventLinkId });
        const meeting = await Meeting.findOne({ link: eventLinkId });
        const questsCount = meeting ? meeting.quests.length : 0;
      
        const updatedEvent = {
          ...event.toObject(),
          meetingsNumber: meetingsCount,
          quests: questsCount,
        };
      
        updatedUserEvents.push(updatedEvent);
      }
      
      const contracts = await Contract.find({ author: userId }).limit(15);

      const user = await User.findById(userId);
      var hasZoom;
      if (user.socials && user.socials.some(social => social.platform === 'zoom')) {
        hasZoom = true;
      } else {
        hasZoom = false;
      }
  

      res.status(200).json({
          meetingsTodayCount,
          eventsTodayCount,
          totalInvoices,
          paidInvoices,
          totalContracts,
          pendingSignatures,
          totalClients,
          activeClients,
          userEvents: updatedUserEvents,
          confirmedMeetings,
          contracts,
          hasZoom
      });
  } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching user's dashboard data.");
  }
};


exports.createEvent = createEvent;
exports.getUserEvents = getUserEvents;
exports.getEvent = getEvent;
exports.meetingConfirm = meetingConfirm;
exports.getUserMeetings = getUserMeetings;
exports.getEvents = getEvents;
exports.getMeetings = getMeetings;
exports.eventDelete = eventDelete;
exports.meetingDelete = meetingDelete;
exports.eventUpdate = eventUpdate;
exports.createClient = createClient;
exports.clientDelete = clientDelete;
exports.getClients = getClients;
exports.getClient = getClient;
exports.clientUpdate = clientUpdate;
exports.convertFile = convertFile;
exports.createContract = createContract;
exports.getContract = getContract;
exports.signContract = signContract;
exports.downloadContract = downloadContract;
exports.getContracts = getContracts;
exports.getContractsCounts = getContractsCounts;
exports.getInvoices = getInvoices;
exports.updateAccount = updateAccount;
exports.getInvoice = getInvoice;
exports.downloadInvoice = downloadInvoice;
exports.getUserStatsDashboard = getUserStatsDashboard;