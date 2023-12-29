const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  type: { type: String },
  verified: { type: Boolean, default: false },
  otp_code: { type: String },
  company: { type: String },
  members: { type: String },
  socials: [
    {
      platform: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      accountId: { type: String },
      publishableKey: { type: String }
    }
  ],
  phone: { type: String },
  address: { type: String },
  zip: { type: String },
  country: { type: Schema.Types.Mixed },
  companyEmail: { type: String },
  companyPhone: { type: String },
  companyAddress: { type: String },
  companyZip: { type: String },
  companyCountry: { type: Schema.Types.Mixed },
  card: { type: String },
  cardExpires: { type: String },
  cardCCV: { type: String },
  role: { type: Schema.Types.Mixed },
  image: { type: String },
  timezone: {
    type: String,
    default: 'UTC'
  },
});

userSchema.statics.findById = function (id, callback) {
  return this.findOne({ _id: id }, callback);
};

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
