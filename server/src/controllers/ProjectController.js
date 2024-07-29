const mongoose = require('mongoose');
const projectModel = require('../models/projectModel');
const { responseHandler } = require('../utils/responseHandler');
require('dotenv').config();
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const s3 = new AWS.S3();

// Configure Multer and S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `uploads/${Date.now()}_${file.originalname}`);
    }
  })
});



exports.getAllProjects = (req, res, next) => {
    // const userId = req.user._id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    projectModel.find().select('_id name description created_by attachments members threads')
    .populate('created_by',' _id firstName lastName email ')
    .populate('members.user', '_id firstName lastName email')
    .limit(limit)
    .exec().then(docs => {
            
                docs.map(doc => {
                return {
                    id:doc._id,
                    name: doc.name,
                    description: doc.description,
                    created_by: doc.created_by,
                    attachments: doc.attachments,
                    members: docs.members,
                    Threads: docs.Thread,
                    request: {
                        method: 'GET',
                    }
                }
                } )
                responseHandler(res, 200, "All Projects found successfully", {docs });
        
    }).catch(err => {       
        responseHandler(res, 500, "An error occurred", { error: err });
    });
};

exports.createProject = (req, res, next) => {
    const userId = req.user._id;
    const data = new projectModel({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        created_by: userId,
        members: [{
            user: userId,
            role: 'admin',
            permissions: {
                create: true,
                read: true,
                update: true,
                delete: true
            }
        }],
        Thread: [],
        attachments: []
    });
 
    data.save()
        .then(docs => {
            responseHandler(res, 201, "Project created successfully", {
                project: {
                    id: docs._id,
                    name: docs.name,
                    description: docs.description,
                    created_by: docs.created_by,
                    attachments: docs.attachments,
                    members: docs.members,
                    Threads: docs.Thread,
                    request: {
                        method: 'POST',
                    }
                }
            });
        })
        .catch(err => {
            // console.error("Error creating project:", err); 
            responseHandler(res, 500, "An error occurred", { error: err });
        });
};


exports.getProjectById = async (req, res, next) => {
    const id = req.params.id;

    try {
        const project = await projectModel.findById(id)
            .populate('created_by', '_id firstName lastName email')
            .populate('attachments', '_id type data')
            .populate('members.user', '_id firstName lastName email')
            .populate({
                path: 'Thread',
                populate: [
                    {
                        path: 'creator_id',
                        select: 'firstName lastName'
                    },
                    {
                        path: 'messages',
                        populate: {
                            path: 'creator_id',
                            select: 'firstName lastName'
                        }
                    }
                ]
            })
            .exec();

        if (!project) {
            return responseHandler(res, 404, "Project not found", {});
        }

        const formattedProject = {
            id: project._id,
            name: project.name,
            description: project.description,
            created_by: project.created_by,
            attachments: project.attachments,
            members: project.members,
            Threads: project.Thread.map(thread => ({
                id: thread._id,
                title: thread.title,
                creator_id: {
                    id: thread.creator_id._id,
                    firstName: thread.creator_id.firstName,
                    lastName: thread.creator_id.lastName
                },
                messages: thread.messages.map(message => ({
                    id: message._id,
                    message: message.message,
                    createdAt: message.createdAt,
                    creator_id: {
                        id: message.creator_id._id,
                        firstName: message.creator_id.firstName,
                        lastName: message.creator_id.lastName
                    }
                    
                }))
            })),
            request: {
                method: 'GET'
            }
        };

        responseHandler(res, 200, "Project found successfully", { project: formattedProject });
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};



exports.updateProject = (req, res, next) => {
    const id = req.params.id
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    projectModel.findByIdAndUpdate({ _id: id }, { $set: updateOps })
    .populate('created_by','_id firstName lastName email ')
    .populate('members.user', '_id firstName lastName email')
    .populate('Thread', '_id messages creator_id')
    .exec().then(docs => {
        if(!docs){
           return responseHandler(res, 404, "No valid entry found for provided ID", {id : id});
        }
        responseHandler(res, 200, "Project updated successfully", {
            project: {
                id:docs._id,
                name: docs.name,
                description: docs.description,
                created_by: docs.created_by,
                attachments: docs.attachments,
                members: docs.members,
                Threads: docs.Thread,
                request: {
                    method: 'PATCH',
                }
            }
        });
    }).catch(err => {       
        responseHandler(res, 500, "An error occurred", { error: err });
    });
};

exports.deleteProject = async (req, res, next) => {
    const projectId = req.params.id;
    const userId = req.user._id;

    try {
        // Find the project and populate members
        const project = await projectModel.findById(projectId).populate('members.user', '_id');
        
        if (!project) {
            return responseHandler(res, 404, "No valid entry found for provided ID", { id: projectId });
        }
        // Find if the user is a member of the project
        const member = project.members.find(member => member.user._id.toString() === userId.toString());
        if (!member) {
            return responseHandler(res, 403, "User is not a member of this project", {});
        }
        
        // Check if the member has admin role
        if (member.role !== 'admin') {
            return responseHandler(res, 403, "User does not have permission to delete this project", {});
        }

        // Proceed with deleting the project
        const result = await projectModel.deleteOne({ _id: projectId });

        if (result.deletedCount === 0) {
            return responseHandler(res, 404, "No valid entry found for provided ID", { id: projectId });
        }

        responseHandler(res, 204, "Project deleted successfully", {});
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};



// Upload attachments
exports.uploadAttachments = (req, res, next) => {
    const id = req.params.id;
  
    if (!req.files || req.files.length === 0) {
      return responseHandler(res, 400, "No files were uploaded.", {});
    }
  
    const attachmentUrls = req.files.map(file => file.location); // S3 provides the URL of the uploaded file
  
    projectModel.updateOne(
      { _id: id },
      { $push: { attachments: { $each: attachmentUrls } } }
    ).exec()
      .then(docs => {
        responseHandler(res, 200, "Attachment added successfully", { project: docs });
      })
      .catch(err => {
        responseHandler(res, 500, "Sorry, an error occurred", { error: err });
      });
  };

  //  Delete attachment
  
  exports.deleteAttachment = (req, res, next) => {
    const id = req.params.id;
    const attachmentUrl = req.body.attachment;
  
    if (!attachmentUrl) {
      return responseHandler(res, 400, "No attachment URL provided.", {});
    }
  
    // Extract file name from URL for deletion
    const fileName = attachmentUrl.split('/').pop();
  
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${fileName}`
    };
  
    s3.deleteObject(params, (err, data) => {
      if (err) {
        return responseHandler(res, 500, "Failed to delete file from S3", { error: err });
      }
  
      projectModel.updateOne({ _id: id }, { $pull: { attachments: attachmentUrl } })
        .exec()
        .then(docs => {
          responseHandler(res, 200, "Attachment deleted successfully", { project: docs });
        })
        .catch(err => {
          responseHandler(res, 500, "Sorry, an error occurred", { error: err });
        });
    });
  };

exports.updateMember = async (req, res, next) => {
    const user = req.body.user;
    const projectId = req.params.id;      
    const role = req.body.role || 'user';
    const permissions = req.body.permissions || {
        create: false,
        read: true,
        update: false,
        delete: false
    };

    try {
        const project = await projectModel.findById(projectId);

        if (!project) {
            return responseHandler(res, 404, "Project not found", {});
        }

        // Check if the user is already a member of the project
        const existingMember = project.members.find(member => member.user.toString() === user);

        if (existingMember) {
            // Update existing member's role and permissions
            existingMember.role = role;
            existingMember.permissions = permissions;

            await project.save();

            return responseHandler(res, 200, "Member updated successfully", { project });
        }

        // Add new member to the project
        project.members.push({
            user: user,
            role: role,
            permissions: permissions
        });

        await project.save();

        responseHandler(res, 200, "Member added successfully", { project });
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};



exports.removeMember = async (req, res, next) => {
    const  user = req.body.user;
    const projectId = req.params.id;

    try {
        const project = await projectModel.findById(projectId);

        if (!project) {
            return responseHandler(res, 404, "Project not found", {});
        }

        // Filter out the member to be removed
        project.members = project.members.filter(member => member.user.toString() !== user);

        await project.save();

        responseHandler(res, 200, "Member removed successfully", { project });
    } catch (err) {
        responseHandler(res, 500, "An error occurred", { error: err });
    }
};
