const mongoose = require('mongoose');
const attachmentModel = require('../models/attachmentModel');
const { responseHandler } = require('../utils/responseHandler');
const ProjectModel = require('../models/projectModel');
const path = require('path');
const fs = require('fs');

exports.getAllAttachments = (req, res, next) => {
    const projectId = req.params.id; // Get project ID from request parameters

    attachmentModel.find({ project: projectId })
        .select('_id type data project')
        .populate('project', '_id name description created_by attachments members threads')
        .exec()
        .then(docs => {
            const response = docs.map(doc => {
                return {
                    id: doc._id,
                    type: doc.type,
                    data: doc.data,
                    project: doc.project,
                    request: {
                        method: 'GET',
                    }
                };
            });
            responseHandler(res, 200, "All Attachments for the project found successfully", { docs: response });
        })
        .catch(err => {
            responseHandler(res, 500, "An error occurred please check", { error: err });
        });
};

exports.createAttachment = async (req, res, next) => {
    if (!req.file) {
        return responseHandler(res, 400, "No file uploaded");
    }
    const file = req.file;
    const extension = path.extname(file.originalname).slice(1); // Get file extension without the dot

    const data = new attachmentModel({
        _id: new mongoose.Types.ObjectId(),
        type: extension,
        data: file.filename,
        project: req.params.id
    });

    try {
        // Save the new thread
        const attachment = await data.save();

        // Add the new thread ID to the project's Thread array
        await ProjectModel.updateOne(
            { _id: req.params.id },
            { $push: { attachments: attachment._id } }
        );
        responseHandler(res, 201, "Attachment created successfully", {
            attachment: {
                id: attachment._id,
                type: attachment.type,
                data: attachment.data,
                project: attachment.project,
                request: {
                    method: 'POST',
                }
            }
        });
    }catch(err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    };
};

exports.getAttachment = (req, res, next) => {
    const id = req.params.id;
    attachmentModel
        .findById({_id: id})
        .select('_id type data')
        .exec()
        .then(attachment => {
            responseHandler(res, 200, "Attachment found successfully", { attachment: {
                id: attachment._id,
                type: attachment.type,
                data: attachment.data,
                project: attachment.project,
                request: {
                    method: 'POST',
                }
            } });
        })
        .catch(err => {
            responseHandler(res, 500, "An error occurred", { error: err });
        });
};

exports.updateAttachment = (req, res, next) => {
    const id = req.params.id;

    // Update with new file details
    const file = req.file;
    const extension = path.extname(file.originalname).slice(1); // Get file extension without the dot

    attachmentModel.findByIdAndUpdate(id, 
        { 
            type: extension,
            data: file.filename
        },
        {new: true}
    ).exec()
        .then(attachment => {
            if (!attachment) {
                return responseHandler(res, 404, "Attachment not found");
            }

            return responseHandler(res, 200, "Attachment updated successfully", { 
                attachment: {
                    id: attachment._id,
                    type: attachment.type,
                    data: attachment.data,
                    project: attachment.project,
                    request: {
                        method: 'POST',
                    }
                }
             });
        })
        .catch(err => {
            responseHandler(res, 500, "An error occurred", { error: err });
        });
};

exports.deleteAttachment = async (req, res, next) => {
    const id = req.params.id;

    try {
        // Find the attachment by ID
        const attachment = await attachmentModel.findById(id).exec();
        
        if (!attachment) {
            return responseHandler(res, 404, "Attachment not found");
        }

        // Delete the file
        const filePath = path.join(__dirname, '../uploads/', attachment.data);
        fs.unlink(filePath, err => {
            if (err) {
                console.error("Failed to delete file:", err);
                // Handle file deletion failure
            }
        });

        // Remove the attachment from the database
        await attachmentModel.deleteOne({ _id: id }).exec();

        // Send success response
        responseHandler(res, 200, "Attachment deleted successfully");
    } catch (err) {
        console.error("Error deleting attachment:", err);
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};
