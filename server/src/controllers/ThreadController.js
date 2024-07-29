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
       
        // Check if the member has admin role
        if (member.role !== 'admin') {
            return responseHandler(res, 403, "User does not have permission to create a thread for this project", {});
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
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid ID format", { error: "The provided ID is not a valid id" });
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


exports.updateThread = async (req, res, next) => {
    const id = req.params.id;
    const { title, description } = req.body;

    // Check if at least one of the fields is provided
    if (!title && !description) {
        return responseHandler(res, 400, "At least one of title or description is required", {});
    }

    const updateOps = {};
    if (title !== undefined) updateOps.title = title;
    if (description !== undefined) updateOps.description = description;

    const userId = req.user._id;

    try {
        // Find the thread
        const thread = await ThreadModel.findById(id);
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

        // Check if the member has admin role
        if (member.role !== 'admin') {
            return responseHandler(res, 403, "User does not have permission to update this thread", {});
        }

        // Update the thread
        await ThreadModel.updateOne({ _id: id }, { $set: updateOps });

        responseHandler(res, 200, "Thread updated successfully", {
            request: {
                method: 'PATCH',
            }
        });
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};


exports.deleteThread = async (req, res, next) => {
    const userId = req.user._id;
    const id = req.params.id;
    try {
        // find the thread
        console.log(id);
        const thread = await ThreadModel.findById(id);
        console.log(thread);
        const projectId = thread.project;
        // Find the project and populate members
         const project = await ProjectModel.findById(projectId).populate('members.user', '_id');
           console.log(project); 
        if (!project) {
                return responseHandler(res, 404, "No valid entry found for provided ID",{});
        }
        // Find if the user is a member of the project
        const member = project.members.find(member => member.user._id.toString() === userId.toString());
        if (!member) {
                return responseHandler(res, 403, "User is not a member of this project", {});
        }
       
        // Check if the member has admin role
        if (member.role !== 'admin') {
            return responseHandler(res, 403, "User does not have permission to create a thread for this project", {});
        }
        ThreadModel
        .deleteOne({ _id: id
        })
        .exec()
        .then(docs => {
            responseHandler(res, 200, "Thread deleted successfully", {docs });
        })}
    catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    };
};