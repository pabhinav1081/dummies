const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {type: String,   enum: ['user', 'admin'], default: 'user' },
  totalPoints: { type: Number, default: 0 },
  eventScores: [{
    eventCode: { type: String, required: true },
    points: { type: Number, default: 0 }
  }],
}, { timestamps: true });


userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    
  }
});


userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);