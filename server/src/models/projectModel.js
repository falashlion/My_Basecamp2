const mongoose = require('mongoose');

// Define the members schema
const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true
  },
  permissions: {
    create: { type: Boolean, required: true },
    read: { type: Boolean, required: true },
    update: { type: Boolean, required: true },
    delete: { type: Boolean, required: true }
  }
});

// Define the project schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  Thread: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread'
  }]
}, { timestamps: true });

// Create the model
const Project = mongoose.model('Project', projectSchema);

// Export the model
module.exports = Project;
