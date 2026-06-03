// import mongoose from 'mongoose';

// const urlSchema = new mongoose.Schema({
//   originalUrl: { type: String, required: true },
//   shortCode: { type: String, required: true, unique: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   clickCount: { type: Number, default: 0 },
// }, { timestamps: true });

// export default mongoose.model('Url', urlSchema);


import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  originalUrl:  { type: String, required: true },
  shortCode:    { type: String, required: true, unique: true },
  alias:        { type: String, sparse: true, unique: true, default: undefined },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clickCount:   { type: Number, default: 0 },
  expiresAt:    { type: Date, default: null },
  isActive:     { type: Boolean, default: true },
  isPublic:     { type: Boolean, default: false },
  isFavourite:  { type: Boolean, default: false },
  pingResult:   {
    status:       { type: String, enum: ['live', 'redirect', 'dead'], default: null },
    responseTime: { type: Number, default: null },
    checkedAt:    { type: Date, default: null }
  }
}, { timestamps: true });

// Virtual: the actual short identifier used in URLs
urlSchema.virtual('shortId').get(function () {
  return this.alias || this.shortCode;
});

export default mongoose.model('Url', urlSchema);