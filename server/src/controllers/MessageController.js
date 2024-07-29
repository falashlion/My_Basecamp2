const mongoose = require('mongoose');
const { responseHandler } = require('../utils/responseHandler');
const messageModel = require('../models/messageModel');
const ThreadModel = require('../models/ThreadModel');
const ProjectModel = require('../models/projectModel');


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

exports.updateMessage = async (req, res, next) => {
    const id = req.params.id;
    const { message } = req.body;

    // Check if at least one of the fields is provided
    if (!message) {
        return responseHandler(res, 400, "nothing to be updated", {});
    }

    const updateOps = {};
    if (message !== undefined) updateOps.message = message;
    
    const userId = req.user._id;

    try {
        const message = await messageModel.findById(id);
        const ThreadId = message.thread_id.toString();
        console.log(ThreadId);
        
        // Find the thread
        const thread = await ThreadModel.findById(ThreadId.toString());
        if (!thread) {
            return responseHandler(res, 404, "No valid entry found for provided ID", {});
        }

        const projectId = thread.project;
        // Find the project and populate members
        const project = await ProjectModel.findById(projectId).populate('members.user', '_id');
        if (!project) {
            return responseHandler(res, 404, "No valid entry found for provided ID", {});
        }

        // Find if the user is a member of the project
        const member = project.members.find(member => member.user._id.toString() === userId.toString());
        if (!member) {
            return responseHandler(res, 403, "User is not a member of this project", {});
        }

    messageModel.updateOne({ _id: id }, { $set: updateOps }).exec().then(result => {
        responseHandler(res, 200, "message updated successfully", {
            request: {
                method: 'PATCH',
            }
        });
    })} catch(err ) {
        responseHandler(res, 500, "An error occurred", { error: err });
    };
}

exports.deleteMessage = (req, res, next) => {
    const id = req.params.id;
    messageModel.deleteOne({ _id: id }).exec().then(result => {
        responseHandler(res, 200, "message deleted successfully", {
            request: {
                method: 'DELETE',
            }
        });
    }).catch(err => {
        responseHandler(res, 500, "An error occurred", { error: err });
    });
}