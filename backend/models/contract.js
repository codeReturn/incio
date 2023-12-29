const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contractSchema = new mongoose.Schema({
  signature: { type: String },
  title: { type: String, required: true },
  contractContent: { type: String, required: true },
  inputs: [{ type: Schema.Types.Mixed }],
  otherSign: { type: Boolean, default: false },
  signerEmail: { type: String },
  status: { type: Number, default: 0 },
  signedSignature: { type: String },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Contract', contractSchema);