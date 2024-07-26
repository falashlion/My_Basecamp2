const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth-check');
const ThreadController = require('../controllers/ThreadController');
const MessageController = require('../controllers/MessageController');


// get a specific Thread

router.get('/:threadId', ThreadController.getThread);

// update a specific Thread

router.patch('/:threadId', checkAuth, ThreadController.updateThread);

// delete a specific Thread

router.delete('/:threadId', checkAuth, ThreadController.deleteThread);

// messages  

// get all messages

router.get('/:id/messages', MessageController.getAllMessages);

// create a message

router.post('/:id/messages/create', checkAuth, MessageController.createMessage);


module.exports = router;