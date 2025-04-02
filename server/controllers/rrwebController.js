const Recording = require('../models/Recording')

exports.createRecording = async (req, res) => {
    try {
        const { recordingId, userId, timestamp, events } = req.body;

        // Validate required fields
        if (!recordingId || !timestamp || !events || !Array.isArray(events)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        // Extract URL from the first event if available
        const url = events[0]?.data?.href || "Unknown URL";

        // Create recording object
        const newRecording = new Recording({
            recordingId,
            userId: userId || null,
            timestamp,
            url,
            events
        });

        await newRecording.save();

        res.status(201).json({
            message: "Recording saved successfully",
            recordingId: newRecording.recordingId
        });

    } catch (error) {
        console.error("Error saving recording:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getRecordings = async (req, res) => {
    try {
      const recordings = await Recording.find({ userId: req.user._id })
        .select('recordingId url timestamp')
        .sort({ timestamp: -1 });
        
      // Return the list of recordings for the user
      res.status(200).json(recordings);
    } catch (error) {
      console.error('Error fetching user recordings:', error);
      res.status(500).json({ message: 'Server error while fetching user recordings' });
    }
  };

  exports.getRecordingById = async (req, res) => {
    try {
      const recording = await Recording.findOne({ recordingId: req.params.id });
      
      if (!recording) {
        return res.status(404).json({ message: 'Recording not found' });
      }
      
      res.status(200).json(recording);
    } catch (error) {
      console.error('Error fetching recording:', error);
      res.status(500).json({ message: 'Server error while fetching recording' });
    }
  };
  
