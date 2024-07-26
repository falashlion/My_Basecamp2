const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/auth-check');
const ProjectController = require('../controllers/ProjectController');
const attachmentController = require('../controllers/AttachmentController');
const ThreadController = require('../controllers/ThreadController');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null,file.originalname);
    }
});

const File = multer({ storage: storage });

// get all projects
router.get('/', ProjectController.getAllProjects);
// create a new project
router.post('/', checkAuth, ProjectController.createProject);

// get a specific project
router.get('/:id', ProjectController.getProjectById);

// update a specific project
router.patch('/:id', checkAuth, ProjectController.updateProject);

// delete a specific project
router.delete('/:id', checkAuth, ProjectController.deleteProject);

// Route to add a new member to a project
router.patch('/:id/updateMember', checkAuth, ProjectController.updateMember);

// Route to remove a member from a project
router.patch('/:id/removeMember', checkAuth, ProjectController.removeMember);

// Attachments

// upload attachments for a specific project
router.post('/:id/attachments/create', checkAuth, File.single('attachment'), attachmentController.createAttachment);

// get all attachments for a specific project
router.get('/:id/attachments', checkAuth, attachmentController.getAllAttachments);

// Threads

// create a new thread for a specific project
router.post('/:id/threads/create', checkAuth, ThreadController.createThread);

// get all threads for a specific project
router.get('/:id/threads', checkAuth, ThreadController.getAllThreads);

module.exports = router;
