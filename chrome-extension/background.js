import axios from 'axios';

// Listen for when the extension is installed or activated
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed!");
    checkLoginState();
  });
  
  const checkLoginState = () => {
    chrome.cookies.get({ url: 'http://localhost:5173', name: 'token' }, (cookie) => {
      if (cookie) {
        chrome.cookies.get({ url: 'http://localhost:5173', name: 'user' }, (userCookie) => {
          if (userCookie) {
            try {
              const userInfo = JSON.parse(decodeURIComponent(userCookie.value));
              
              // Save user info including the userId
              chrome.storage.local.set({
                isLoggedIn: true,
                userName: userInfo.fullName || "Guest",
                userProfilePicture: userInfo.profilePicture || "",
                userId: userInfo.id || ""
              });
              
              // Send the login state to content script
              sendLoginStateToContentScript(true, userInfo.fullName || "Guest", userInfo.profilePicture || "", userInfo.userId || "");
            } catch (error) {
              console.error("Error parsing user cookie:", error);
              setLoggedOutState();
            }
          } else {
            setLoggedOutState();
          }
        });
      } else {
        setLoggedOutState();
      }
    });
  };
  
  // Helper function to set logged out state
  const setLoggedOutState = () => {
    chrome.storage.local.set({
      isLoggedIn: false,
      userName: "",
      userProfilePicture: "",
      userId: ""
    });
    
    // Notify content script about logout
    sendLoginStateToContentScript(false, "", "", "");
  };
  
  // Function to send login state to the content script
  const sendLoginStateToContentScript = (isLoggedIn, userName, userProfilePicture, userId) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.log("No active tab found.");
            return;
        }
        tabs.forEach((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => console.log("Checking if content script is active...")
            });

            chrome.tabs.sendMessage(tab.id, {
                type: "LOGIN_STATE",
                isLoggedIn,
                userName,
                userProfilePicture,
                userId
            }).catch(error => {
                console.log(`Could not send message to tab ${tab.id}:`, error);
            });
        });
    });
  };

  // Function to send the recorded data to the server
  const sendRecordingToServer = async (data) => {
    try {
      // Send request using axios
      const response = await axios.post('http://localhost:5000/api/recording/create', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      return { success: response.status === 201, response: response.data };
    } catch (error) {
      console.error('Background script error sending recording to server:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Listen for cookie changes
  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.domain.includes('localhost') && 
        (changeInfo.cookie.name === "token" || changeInfo.cookie.name === "user")) {
      if (changeInfo.removed) {
        setLoggedOutState();
      } else {
        checkLoginState();
      }
    }
  });
  
  // Handle messages from popup or other parts of the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_LOGIN_STATE") {
      chrome.storage.local.get(["isLoggedIn", "userName", "userProfilePicture", "userId"], (data) => {
        sendResponse(data);
      });
      return true; 
    }
    else if (message.type === "LOGOUT") {
      // Handle logout by removing the cookies
      chrome.cookies.remove({ url: 'http://localhost:5173', name: 'token' }, () => {
        chrome.cookies.remove({ url: 'http://localhost:5173', name: 'user' }, () => {
          setLoggedOutState();
          sendResponse({ success: true });
        });
      });
      return true;
    }
    // Handle recording status updates from content script
    else if (message.action === "recordingStatusChanged") {
      // Store recording status in local storage for popup to access
      chrome.storage.local.set({
        isRecording: message.isRecording,
        currentRecordingId: message.recordingId || null
      });
      return true;
    }
    // Handle request to send recording data to server
    else if (message.action === "sendRecordingToServer") {
      // Use async/await pattern with sendResponse
      (async () => {
        const result = await sendRecordingToServer(message.data);
        sendResponse(result);
      })();
      return true; // Required for async sendResponse
    }
  });
  
  // Listen for tab updates to check login state when navigating
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('localhost:5173')) {
      checkLoginState();
    }
  });