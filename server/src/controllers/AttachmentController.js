const mongoose = require('mongoose');
const attachmentModel = require('../models/attachmentModel');
const { responseHandler } = require('../utils/responseHandler');
const ProjectModel = require('../models/projectModel');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const s3 = new AWS.S3();

// Configure Multer and S3
const upload = require('../../s3Config'); // Assuming s3Config.js configures multer with S3

exports.getAllAttachments = (req, res, next) => {
    const projectId = req.params.id;

    attachmentModel.find({ project: projectId })
        .select('_id type data project')
        .populate('project', '_id name description created_by attachments members threads')
        .exec()
        .then(docs => {
            const response = docs.map(doc => ({
                id: doc._id,
                type: doc.type,
                data: doc.data,
                project: doc.project,
                request: { method: 'GET' }
            }));
            responseHandler(res, 200, "All Attachments for the project found successfully", { docs: response });
        })
        .catch(err => {
            responseHandler(res, 500, "An error occurred please check", { error: err });
        });
};

exports.createAttachment = async (req, res, next) => {
    console.log(process.env.AWS_S3_BUCKET);
    if (!req.file) {
        return responseHandler(res, 400, "No file uploaded");
    }
    const file = req.file;
    const extension = path.extname(file.originalname).slice(1);

    const data = new attachmentModel({
        _id: new mongoose.Types.ObjectId(),
        type: extension,
        data: file.location, // URL provided by S3
        project: req.params.id
    });

    try {
        const attachment = await data.save();
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
                request: { method: 'POST' }
            }
        });
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};

exports.getAttachment = (req, res, next) => {
    const id = req.params.id;
    attachmentModel.findById(id)
        .select('_id type data')
        .exec()
        .then(attachment => {
            responseHandler(res, 200, "Attachment found successfully", {
                attachment: {
                    id: attachment._id,
                    type: attachment.type,
                    data: attachment.data,
                    project: attachment.project,
                    request: { method: 'POST' }
                }
            });
        })
        .catch(err => {
            responseHandler(res, 500, "An error occurred", { error: err });
        });
};

exports.updateAttachment = (req, res, next) => {
    const id = req.params.id;
    const file = req.file;
    const extension = path.extname(file.originalname).slice(1);

    attachmentModel.findByIdAndUpdate(id, 
        { 
            type: extension,
            data: file.location // URL provided by S3
        },
        { new: true }
    ).exec()
        .then(attachment => {
            if (!attachment) {
                return responseHandler(res, 404, "Attachment not found");
            }

            responseHandler(res, 200, "Attachment updated successfully", {
                attachment: {
                    id: attachment._id,
                    type: attachment.type,
                    data: attachment.data,
                    project: attachment.project,
                    request: { method: 'POST' }
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
        const attachment = await attachmentModel.findById(id).exec();
        if (!attachment) {
            return responseHandler(res, 404, "Attachment not found");
        }

            await attachmentModel.deleteOne({ _id: id }).exec();
            responseHandler(res, 200, "Attachment deleted successfully");
       
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};
