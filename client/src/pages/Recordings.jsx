import React, { useState, useEffect } from 'react';
import { rrwebService } from '../utils/api';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { Clock } from 'lucide-react';
import Loader from '../components/Loader';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerEvents, setPlayerEvents] = useState(null);
  const playerContainerRef = React.useRef(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const response = await rrwebService.getRecordings();
        setRecordings(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recordings. Please try again later.');
        setLoading(false);
        console.error('Error fetching recordings:', err);
      }
    };
  
    fetchRecordings();
  }, []);

  // Set up the player when playerEvents changes and playerContainerRef is available
  useEffect(() => {
    if (playerVisible && playerEvents && playerContainerRef.current) {
      try {
        // Clear container first
        playerContainerRef.current.innerHTML = '';
        
        // Initialize player with events
        new rrwebPlayer({
          target: playerContainerRef.current,
          props: {
            events: playerEvents,
            width: 800,
            height: 450,
            autoPlay: true,
            mouseTail: false
          }
        });
        
        setPlayerLoading(false);
      } catch (err) {
        console.error('Error initializing player:', err);
        setError(`Failed to initialize player: ${err.message}`);
        setPlayerLoading(false);
      }
    }
  }, [playerEvents, playerVisible]);

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handlePlayRecording = async (recordingId) => {
    try {
      setPlayerVisible(true);
      setSelectedRecording({ recordingId });
      setPlayerEvents(null);
      
      // Fetch the specific recording data
      const recordingData = await rrwebService.getRecordingById(recordingId);
      
      // Check if events exist
      if (recordingData && recordingData.events && recordingData.events.length > 0) {
        // Set the events to trigger the useEffect that will create the player
        setPlayerEvents(recordingData.events);
      } else {
        throw new Error('Recording has no events');
      }
    } catch (err) {
      console.error('Error playing recording:', err);
      setError(`Failed to play recording: ${err.message}`);
      setPlayerLoading(false);
    }
  };

  const closePlayer = () => {
    setPlayerVisible(false);
    setPlayerEvents(null);
    if (playerContainerRef.current) {
      playerContainerRef.current.innerHTML = '';
    }
  };

  if (loading) return (
    <Loader/>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-[#233d4d]">
      <div className="text-[#fe7f2d] text-lg">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#233d4d] p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Recordings</h1>
      
      {/* Player Modal */}
      {playerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#2E4756] border border-white/10 p-6 rounded-xl w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedRecording && `Recording: ${selectedRecording.recordingId}`}
              </h2>
              <button 
                onClick={closePlayer}
                className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-white transition-colors"
              >
                Close
              </button>
            </div>
            
            {playerLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-300">Loading player...</p>
              </div>
            ) : (
              <div ref={playerContainerRef} className="rrweb-player min-h-[450px] rounded-lg overflow-hidden"></div>
            )}
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button className="bg-[#fe7f2d] hover:bg-[#fe7f2d]/90 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors">
          <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <span className="text-lg font-semibold">Start New Recording</span>
        </button>
        <button className="bg-white/5 hover:bg-white/10 text-white p-6 rounded-xl flex flex-col items-center justify-center border border-white/10 transition-colors">
          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <span className="text-lg font-semibold">Import Recording</span>
        </button>
        <button className="bg-white/5 hover:bg-white/10 text-white p-6 rounded-xl flex flex-col items-center justify-center border border-white/10 transition-colors">
          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <span className="text-lg font-semibold">Manage Storage</span>
        </button>
      </div>
      
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-4">All Recordings</h2>
        <table className="min-w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="py-3 px-4 text-left text-white font-semibold">Recording ID</th>
              <th className="py-3 px-4 text-left text-white font-semibold">URL</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Timestamp</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recordings.length > 0 ? (
              recordings.map((recording) => (
                <tr key={recording._id} className="hover:bg-white/5 border-b border-white/10 transition-colors">
                  <td className="py-3 px-4 text-gray-300">{recording.recordingId}</td>
                  <td className="py-3 px-4">
                    {recording.url ? (
                      <a 
                        href={recording.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#fe7f2d] hover:text-[#fe7f2d]/80 transition-colors"
                      >
                        {recording.url}
                      </a>
                    ) : (
                      <span className="text-gray-500">No URL</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{formatDate(recording.timestamp)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        handlePlayRecording(recording.recordingId);
                      }}
                      className="bg-[#fe7f2d] hover:bg-[#fe7f2d]/90 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Play
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 px-4 text-center text-gray-400">
                  No recordings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recordings;