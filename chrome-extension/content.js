import * as rrweb from 'rrweb';

let recorder = null;
let events = [];
let isRecording = false;
let recordingId = null;
let saveTimeout = null;
let userLoggedIn = false;
let currentUserId = null;
let userName = "";
let userProfilePicture = "";

const checkLoginStatus = async () => {
    try {
      const result = await chrome.storage.local.get(['isLoggedIn', 'userId', 'userName', 'userProfilePicture']);
      userLoggedIn = result.isLoggedIn || false;
      currentUserId = result.userId || null;
      userName = result.userName || "";
      userProfilePicture = result.userProfilePicture || "";

    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

checkLoginStatus();

// Generate a unique recording ID
const generateRecordingId = () => `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Function to start recording
const startRecording = () => {
  if (isRecording) {
    console.warn('Recording is already active.');
    return;
  }

  events = [];
  recordingId = generateRecordingId();
  console.log('Starting recording with ID:', recordingId);

  recorder = rrweb.record({
    emit(event) {
      events.push(event);
      scheduleSaveEvents();
    },
    recordCanvas: true,
    collectFonts: true,
    inlineStylesheet: true,
  });

  isRecording = true;

  chrome.runtime.sendMessage({
    action: 'recordingStatusChanged',
    isRecording: true,
    recordingId
  });
};

// Function to stop recording
const stopRecording = async () => {
    if (!isRecording || !recorder) {
      console.warn('No active recording to stop.');
      return;
    }
  
    console.log('Stopping recording:', recordingId);
    recorder();
    recorder = null;
    await saveEvents(); // Make sure this is awaited to complete storage
    isRecording = false;
  
    chrome.runtime.sendMessage({
      action: 'recordingStatusChanged',
      isRecording: false,
      recordingId
    });
  
    // Check if user is logged in, send recording immediately if so
    if (userLoggedIn && currentUserId) {
      console.log('User logged in, sending recording immediately');
      await sendRecordingToServer(currentUserId);
    } else {
      console.log('User not logged in, recording stored for later upload');
    }
  
    recordingId = null;
  };

// Debounced function to save events
const scheduleSaveEvents = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveEvents, 2000);
};

// Save events to storage
const saveEvents = async () => {
  if (!recordingId || events.length === 0) return;

  try {
    const key = `rrweb_recording_${recordingId}`;
    const existing = await chrome.storage.local.get(key);
    const allEvents = [...(existing[key] || []), ...events];

    await chrome.storage.local.set({
      [key]: allEvents,
      rrweb_recordings: await updateRecordingsIndex(recordingId)
    });

    events = [];
    console.log(`Saved ${allEvents.length} events for recording ${recordingId}`);
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

// Update recording index
const updateRecordingsIndex = async (currentRecordingId) => {
  try {
    const result = await chrome.storage.local.get('rrweb_recordings');
    const recordings = result.rrweb_recordings || [];

    if (!recordings.some(rec => rec.id === currentRecordingId)) {
      recordings.push({
        id: currentRecordingId,
        timestamp: Date.now(),
        url: window.location.href,
        title: document.title
      });
    }

    return recordings;
  } catch (error) {
    console.error('Error updating recordings index:', error);
    return [];
  }
};

// Function to send recorded data to the server
const sendRecordingToServer = async (userId) => {
  try {
    const result = await chrome.storage.local.get('rrweb_recordings');
    const recordings = result.rrweb_recordings || [];
    const successfullyUploaded = [];
    
    for (const recording of recordings) {
      const key = `rrweb_recording_${recording.id}`;
      const sessionData = await chrome.storage.local.get(key);
      
      if (sessionData[key]) {
        const data = {
          userId,
          recordingId: recording.id,
          timestamp: recording.timestamp,
          events: sessionData[key],
        };
        
        // Send data to background script instead of directly using axios
        const response = await chrome.runtime.sendMessage({
          action: 'sendRecordingToServer',
          data: data
        });
        
        if (response && response.success) {
          console.log('Session data sent to server successfully via background script');
          await chrome.storage.local.remove(key);
          successfullyUploaded.push(recording.id);
        } else {
          console.error('Failed to send session data to server', response);
        }
      }
    }
    
    // Remove the uploaded recordings from the index
    if (successfullyUploaded.length > 0) {
      const updatedRecordings = recordings.filter(rec => !successfullyUploaded.includes(rec.id));
      
      if (updatedRecordings.length === 0) {
        // If no recordings left, remove the entire index
        await chrome.storage.local.remove('rrweb_recordings');
        console.log('All recordings uploaded and index cleared');
      } else {
        // Otherwise update the index without the uploaded recordings
        await chrome.storage.local.set({ 'rrweb_recordings': updatedRecordings });
        console.log(`${successfullyUploaded.length} recordings uploaded and removed from index`);
      }
    }
  } catch (error) {
    console.error('Error sending recordings to server:', error);
  }
};

// Listen for login events sent from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle login state updates
  if (message.type === 'LOGIN_STATE') {
    userLoggedIn = message.isLoggedIn;
    userName = message.userName;
    userProfilePicture = message.userProfilePicture;
    currentUserId = message.userId;
    
    console.log('Login state updated:', userLoggedIn, 'User ID:', currentUserId);
    
    // If user just logged in, send any pending recordings
    if (userLoggedIn && currentUserId) {
      sendRecordingToServer(currentUserId);
    }
    
    return true;
  }
  
  // Handle recording control messages
  if (message.action === 'startRecording') {
    startRecording();
    sendResponse({ success: true, isRecording: true });
  } else if (message.action === 'stopRecording') {
    stopRecording();
    sendResponse({ success: true, isRecording: false });
  } else if (message.action === 'getRecordingStatus') {
    sendResponse({ isRecording, recordingId });
  }

  return true;
});

// Stop recording before page unload
window.addEventListener('beforeunload', stopRecording);
