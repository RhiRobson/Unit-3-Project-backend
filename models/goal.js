const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const informationSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const goalSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      picture: {
        type: String,
        required: false,
      },
      information: [informationSchema],
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comments: [commentSchema],
  },
  { timestamps: true }
);


const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;