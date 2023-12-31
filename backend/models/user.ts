import mongoose from 'mongoose';

// Mongoose schema for a user
const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Types.ObjectId },
  userID: { type: Number },
});

const User = mongoose.model('User', userSchema);

export default User;
