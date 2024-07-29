const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/auth-check');
const attachmentController = require('../controllers/AttachmentController');
const upload = require('../../s3Config');




// get a specific Attachment
router.get('/:id', attachmentController.getAttachment );

// update a specific Attachment

router.patch('/:id', checkAuth, upload.single('attachment'),attachmentController.updateAttachment);

// delete a specific Attachment

router.delete('/:id', checkAuth, attachmentController.deleteAttachment);


module.exports = router;