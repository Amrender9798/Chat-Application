// messageModel.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    userMsg: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

);

const Message = mongoose.model('Message', messageSchema);

export default Message;
