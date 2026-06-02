// import mongoose from 'mongoose';

// const visitSchema = new mongoose.Schema({
//   urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
//   ip: { type: String, default: 'unknown' },
//   userAgent: { type: String, default: 'unknown' },
//   timestamp: { type: Date, default: Date.now },
// });

// export default mongoose.model('Visit', visitSchema);


import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  urlId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
  ip:        { type: String, default: 'unknown' },
  userAgent: { type: String, default: 'unknown' },
  browser:   { type: String, default: 'Unknown' },
  os:        { type: String, default: 'Unknown' },
  device:    { type: String, default: 'Desktop' },
  country:   { type: String, default: 'Unknown' },
  city:      { type: String, default: 'Unknown' },
  referrer:  { type: String, default: 'Direct' },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Visit', visitSchema);