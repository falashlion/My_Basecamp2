const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth-check');
const MessageController = require('../controllers/MessageController');




// update a message

router.patch('/:id', checkAuth, MessageController.updateMessage);

// delete a message

router.delete('/:id', checkAuth, MessageController.deleteMessage);

module.exports = router;

