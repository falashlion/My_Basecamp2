const mongoose = require('mongoose');
const { responseHandler } = require('../utils/responseHandler');
const messageModel = require('../models/messageModel');
const ThreadModel = require('../models/ThreadModel');


exports.getAllMessages = (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    messageModel.find().select('_id message creator_id thread_id')
    .limit(limit)
    .exec().then(docs => {
        docs.map(doc => {
            return {
                id:docs._id,
                thread_id: docs.thread_id,
                creator_id: docs.creator_id,
                message: docs.message,
                request: {
                    method: 'GET',
                }
            }
        })
        responseHandler(res, 200, "All Messages found successfully", {docs });
    }).catch(err => {       
        responseHandler(res, 500, "An error occurred", { error: err });
    });
}


exports.createMessage = async (req, res, next) => {
    const data = new messageModel( {
        _id: new mongoose.Types.ObjectId(),
        message: req.body.message,   
        creator_id: req.user._id,
        thread_id: req.params.id,
    });

    try {
        // Save the new thread
        const message = await data.save();

        // Add the new thread ID to the project's Thread array
        await ThreadModel.updateOne(
            { _id: req.params.id },
            { $push: { messages: message._id } }
        );

        // Send the response with the created thread information
        responseHandler(res, 201, "message created successfully", {
            message:{
                id:message._id,
                thread_id: message.thread_id,
                creator_id: message.creator_id,
                message: message.message,
                request: {
                    method: 'POST',
                }
            }
        })
    }catch(err){     
        responseHandler(res, 500, "An error occurred", { error: err });
    };
}

exports.updateMessage = (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    messageModel.update({ _id: id }, { $set: updateOps }).exec().then(result => {
        responseHandler(res, 200, "message updated successfully", {
            request: {
                method: 'PATCH',
            }
        });
    }).catch(err => {
        responseHandler(res, 500, "An error occurred", { error: err });
    });
}

exports.deleteMessage = (req, res, next) => {
    const id = req.params.id;
    messageModel.remove({ _id: id }).exec().then(result => {
        responseHandler(res, 200, "message deleted successfully", {
            request: {
                method: 'DELETE',
            }
        });
    }).catch(err => {
        responseHandler(res, 500, "An error occurred", { error: err });
    });
}