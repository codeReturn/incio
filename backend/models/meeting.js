const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const selectedTimeSchema = new mongoose.Schema({
  date: String,
  start: String,
  end: String,
  zoomEventId: String, 
  zoomMeetingLink: String,
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  questions: [{ type: Schema.Types.Mixed }],
  quests: [{ type: Schema.Types.Mixed }],
  date: { type: String, required: true },
  selected_time: selectedTimeSchema,
  link: { type: String, required: true },
  eventauthor: { type: String, required: true },
});

module.exports = mongoose.model('Meeting', meetingSchema);
