const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/auth-check');
const attachmentController = require('../controllers/AttachmentController');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename : function(req, file, cb) {
        cb(null,file.originalname);
    }
});

const File = multer({storage: storage});


// get a specific Attachment
router.get('/:id', attachmentController.getAttachment );

// update a specific Attachment

router.patch('/:id', checkAuth, File.single('attachment'),attachmentController.updateAttachment);

// delete a specific Attachment

router.delete('/:id', checkAuth, attachmentController.deleteAttachment);


module.exports = router;