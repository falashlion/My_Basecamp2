const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth-check');
const ThreadController = require('../controllers/ThreadController');
const MessageController = require('../controllers/MessageController');


// get a specific Thread

router.get('/:id', ThreadController.getThread);

// update a specific Thread

router.patch('/:id', checkAuth, ThreadController.updateThread);

// delete a specific Thread

router.delete('/:id', checkAuth, ThreadController.deleteThread);

// messages  

// get all messages

router.get('/:id/messages', MessageController.getAllMessages);

// create a message

router.post('/:id/messages/create', checkAuth, MessageController.createMessage);


module.exports = router;