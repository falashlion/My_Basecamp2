const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    creator_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thread_id: {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
    }
}, {
    timestamps: true // Optionally add timestamps if you want createdAt and updatedAt fields
});

module.exports = model('Message', messageSchema);
