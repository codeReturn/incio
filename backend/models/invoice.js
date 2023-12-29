const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const invoiceSchema = new mongoose.Schema({
  invoicename: { type: String, required: true },
  invoicedescription : { type: String },
  invoicestatement : { type: String },
  name: { type: String },
  date: { type: Date, required: true },
  email: { type: String },
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: Schema.Types.Mixed },
  zip: { type: String, required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoice_id: { type: String },
  status: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  payment : { type: String },
  service: { type: String },
  paymentIntentId: { type: String },
  items: [{ type: Schema.Types.Mixed }],
  customer: { type: String },
  currency: { type: String }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
