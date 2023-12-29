const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  locationaddress: { type: String },
  eventcalendar: { type: String },
  eventdate: { type: Date, required: true },
  eventavailable: { type: Number, required: true },
  eventduration: { type: String, required: true },
  questions: [{ type: Schema.Types.Mixed }],
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uniquelink: { type: String, required: true, unique: true },
  scheduletimes: [{ type: Schema.Types.Mixed }]
});

module.exports = mongoose.model('Event', eventSchema);