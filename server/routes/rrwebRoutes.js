const express = require('express');
const { createRecording, getRecordings, getRecordingById } = require('../controllers/rrwebController');
const {protect} = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/create', createRecording)
router.get('/get', protect, getRecordings);
router.get('/get/:id', protect, getRecordingById)

module.exports = router;