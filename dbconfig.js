// mongooseConfig.js
import mongoose from 'mongoose';

const URL = 'mongodb://127.0.0.1:27017/chatDB';
const connectToDatabase = async () => {
  try {
    await mongoose.connect(URL);
    console.log(`connected to ${URL} using mongoose`);
  } catch (err) {
    console.error(err);
  }
};

export default connectToDatabase;
