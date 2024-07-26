const { Schema, model } = require('mongoose');

const threadSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    creator_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }]
}, {
    timestamps: true // Optionally add timestamps if you want createdAt and updatedAt fields
});

module.exports = model('Thread', threadSchema);
