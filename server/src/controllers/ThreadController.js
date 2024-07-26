const mongoose = require('mongoose');
const ThreadModel = require('../models/ThreadModel');
const { responseHandler } = require('../utils/responseHandler');
const ProjectModel = require('../models/projectModel');


exports.getAllThreads = (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    ThreadModel.find().select('_id title project creator_id messages').populate('project',' _id name description created_by attachments members threads')
    .limit(limit)
    .exec().then(docs => {
        docs.map(doc => {
            return {
                id:doc._id,
                title: doc.title,
                description: doc.description,
                project: doc.project,
                messages: doc.messages,
                request: {
                    method: 'GET',  
                }
            }
        })
        responseHandler(res, 200, "All Threads found successfully", {docs });
    }).catch(err => {       
        responseHandler(res, 500, "An error occurred", { error: err });
    });
}

exports.createThread = async (req, res, next) => {
    const data = new ThreadModel({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title || "Thread",
        creator_id: req.user._id,
        project: req.params.id,
        messages: req.body.messages || [],
    });

    try {
        // Find the project and populate members
         const project = await ProjectModel.findById(data.project).populate('members.user', '_id');
            
        if (!project) {
                return responseHandler(res, 404, "No valid entry found for provided ID",{});
        }
        // Find if the user is a member of the project
        const member = project.members.find(member => member.user._id.toString() === data.creator_id.toString());
        if (!member) {
                return responseHandler(res, 403, "User is not a member of this project", {});
        }
        console.log(member.role);
        // Check if the member has admin role
        if (member.role !== 'admin') {
            return responseHandler(res, 403, "User does not have permission to delete this project", {});
        }
        // Save the new thread
        const thread = await data.save();

        // Add the new thread ID to the project's Thread array
        await ProjectModel.updateOne(
            { _id: req.params.id },
            { $push: { Thread: thread._id } }
        );

        // Send the response with the created thread information
        responseHandler(res, 201, "Thread created successfully", {
            thread: {
                id: thread._id,
                title: thread.title,
                creator_id: thread.creator_id,
                project: thread.project,
                messages: thread.messages,
                request: {
                    method: 'POST',
                }
            }
        });
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};

exports.getThread = (req, res, next) => {
    const id = req.params.threadId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid ID format", { error: "The provided ID is not a valid threadId" });
    }

    ThreadModel
        .findById(id)
        .select('_id title project messages')
        .populate('messages', '_id message')
        .exec()
        .then(doc => {
            if (!doc) {
                responseHandler(res, 404, "Thread not found", { error: "Thread not found with the given ID" });
            } else {
                responseHandler(res, 200, "Thread found successfully", { thread: {
                    id: doc._id,
                    title: doc.title,
                    creator_id: doc.creator_id,
                    project: doc.project,
                    messages: doc.messages,
                    request: {
                        method: 'POST',
                    }
                } });
            }
        })
        .catch(err => {
            responseHandler(res, 500, "An error occurred", { error: err });
        });
};


exports.updateThread = (req, res, next) => {
    const id = req.params.threadId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    ThreadModel.update({_id: id}, { $set: updateOps })
    .exec()
    .then(docs => {
        responseHandler(res, 200, "Thread updated successfully", {
            request: {
                method: 'PATCH',
            }
        });
    })
    .catch(err => {
        responseHandler(res, 500, "An error occurred", { error: err });
    });
}

exports.deleteThread = (req, res, next) => {
    const id = req.params.id;
    ThreadModel
    .remove({ _id: id
    })
    .exec()
    .then(docs => {
        responseHandler(res, 200, "Thread deleted successfully", {docs });
    })
    .catch(err => {
        responseHandler(res, 500, "An error occurred", { error: err });
    });
};