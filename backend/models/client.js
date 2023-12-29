const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clientSchema =  new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: Schema.Types.Mixed },
    companyName: { type: String, required: true },
    companyEmail: { type: String, required: true },
    companyPhone: { type: String, required: true },
    companyAddress: { type: String, required: true },
    companyZip: { type: String, required: true },
    companyCountry: { type: Schema.Types.Mixed },
    clientCard: { type: String, required: true },
    clientCardExpires: { type: String, required: true },
    clientCardCCV: { type: String, required: true },
    role: { type: Schema.Types.Mixed },
    image: { type: String },
    income: { type: Number, default: 0 },
    outcome: { type: Number, default: 0 },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active:  { type: Boolean, default: false }
});

module.exports = mongoose.model('Client', clientSchema);
