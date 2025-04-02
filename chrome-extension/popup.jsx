import { useState, useEffect } from "react";
import { LogIn, LogOut, Play, Square } from "lucide-react";
import "./styles.css";

function IndexPopup() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [loginState, setLoginState] = useState({
    isLoggedIn: false,
    userName: "",
    userProfilePicture: "",
    userId: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch login state and recording status from background script when component mounts
  useEffect(() => {
    checkLoginState();
    checkRecordingStatus();
  }, []);

  // Function to check login state from background script
  const checkLoginState = () => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ type: "GET_LOGIN_STATE" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting login state:", chrome.runtime.lastError);
        setIsLoading(false);
        return;
      }
      
      setLoginState({
        isLoggedIn: response?.isLoggedIn || false,
        userName: response?.userName || "",
        userProfilePicture: response?.userProfilePicture || "",
        userId: response?.userId || ""
      });
      setIsLoading(false);
    });
  };

  // Function to check current recording status
  const checkRecordingStatus = () => {
    chrome.storage.local.get(["isRecording", "currentRecordingId"], (data) => {
      setIsRecording(data.isRecording || false);
      setRecordingId(data.currentRecordingId || null);
    });
  };

  // Toggle recording state
  const toggleRecording = () => {
    // if (!loginState.isLoggedIn) {
    //   alert("Please log in to start recording");
    //   return;
    // }

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found");
        return;
      }

      const activeTab = tabs[0];
      
      if (!isRecording) {
        // Start recording
        chrome.tabs.sendMessage(activeTab.id, {
          action: "startRecording",
          userId: loginState.userId
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error starting recording:", chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            setIsRecording(true);
            setRecordingId(response.recordingId);
          }
        });
      } else {
        // Stop recording
        chrome.tabs.sendMessage(activeTab.id, {
          action: "stopRecording",
          recordingId: recordingId
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error stopping recording:", chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            setIsRecording(false);
            setRecordingId(null);
          }
        });
      }
    });
  };

  // Handle login/logout
  const handleAuth = async () => {
    if (loginState.isLoggedIn) {
      // Send logout message to background script
      chrome.runtime.sendMessage({ type: "LOGOUT" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error during logout:", chrome.runtime.lastError);
          return;
        }
        
        if (response?.success) {
          setLoginState({
            isLoggedIn: false,
            userName: "",
            userProfilePicture: "",
            userId: ""
          });
        }
      });
    } else {
      // Open login page
      window.open("http://localhost:5173/", "_blank");
    }
  };

  return (
    <div className="p-4 bg-[#233d4d] text-white w-80 rounded-lg border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          TempusRec
        </h2>
        <button
          onClick={handleAuth}
          className="flex items-center space-x-2 text-gray-300 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
        >
          {loginState.isLoggedIn ? (
            <>
              <LogOut size={18} />
              <span>Logout</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Login</span>
            </>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="bg-white/5 rounded-lg p-3 mb-4 backdrop-blur-lg border border-white/10">
        <div className="flex items-center space-x-3">
          <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isRecording ? 'Recording in progress...' : 'Ready to record'}
          </span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center mb-4">
        <button
          onClick={toggleRecording}
          className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-[#fe7f2d] hover:bg-[#fe7f2d]/90'
          }`}
        >
          {isRecording ? (
            <Square size={24} fill="white" />
          ) : (
            <Play size={24} fill="white" />
          )}
        </button>
      </div>

      {/* Footer */}
      {loginState.isLoggedIn && (
        <div className="text-center text-sm text-gray-400">
          <p>Logged in as {loginState.userName || "User"}</p>
        </div>
      )}

      {/* App Link */}
      <a
        href="http://localhost:5173/home"
        target="_blank"
        className="mt-4 block text-center bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg border border-white/10 transition-colors"
      >
        Open TempusRec Dashboard
      </a>
    </div>
  );
}

export default IndexPopup;