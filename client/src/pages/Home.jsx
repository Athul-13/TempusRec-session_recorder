import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, User, LogOut, Settings, Calendar, Clock, HomeIcon } from 'lucide-react';
import logo from '../assets/logo2.png';
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { authService } from '../utils/api';

function Home() {
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const user = useSelector((state) => state.auth)
    console.log('user',user);

    // Mock data for recent recordings
    const recentRecordings = [
        { id: 1, title: "Team Meeting", date: "Mar 28, 2025", duration: "45 min" },
        { id: 2, title: "Project Kickoff", date: "Mar 25, 2025", duration: "60 min" },
        { id: 3, title: "Client Presentation", date: "Mar 22, 2025", duration: "30 min" },
        { id: 4, title: "Brainstorming Session", date: "Mar 20, 2025", duration: "90 min" },
    ];

    // Mock data for upcoming sessions
    const upcomingSessions = [
        { id: 1, title: "Weekly Standup", date: "Mar 30, 2025", time: "09:00 AM" },
        { id: 2, title: "Product Demo", date: "Apr 02, 2025", time: "11:30 AM" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // 2-second delay

        return () => clearTimeout(timer);
    }, []);

    const handleLogout = async() => {
        await authService.logout();
        await dispatch(logout());
        navigate('/');
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-[#233d4d] flex">
            {/* Sidebar */}
            <div className={`bg-[#2E4756] h-screen fixed top-0 left-0 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="TempusRec Logo" className="h-10" />
                    </div>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white">
                        <Menu size={20} />
                    </button>
                </div>
                <div className="px-4 py-6">
                    <nav>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/home" className="flex items-center space-x-3 text-white bg-[#fe7f2d] px-4 py-3 rounded-lg">
                                    <HomeIcon size={20} />
                                    <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/recordings" className="flex items-center space-x-3 text-gray-300 hover:bg-white/10 px-4 py-3 rounded-lg">
                                    <Clock size={20} />
                                    <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Recordings</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/schedule" className="flex items-center space-x-3 text-gray-300 hover:bg-white/10 px-4 py-3 rounded-lg">
                                    <Calendar size={20} />
                                    <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Schedule</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" className="flex items-center space-x-3 text-gray-300 hover:bg-white/10 px-4 py-3 rounded-lg">
                                    <Settings size={20} />
                                    <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Settings</span>
                                </Link>
                            </li>
                            <li className="pt-6">
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 text-gray-300 hover:bg-white/10 px-4 py-3 rounded-lg w-full"
                                >
                                    <LogOut size={20} />
                                    <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Logout</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-[#2E4756]/70 backdrop-blur-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-white hover:bg-white/10 rounded-full">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 h-2 w-2 bg-[#fe7f2d] rounded-full"></span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-[#fe7f2d] rounded-full flex items-center justify-center text-white">
                                    <User size={20} />
                                </div>
                                <span className="text-white font-medium">Jane Doe</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    <h1 className="text-3xl font-bold text-white mb-8">Welcome back, Jane!</h1>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <button className="bg-[#fe7f2d] hover:bg-[#fe7f2d]/90 text-white p-6 rounded-xl flex flex-col items-center justify-center transition-colors">
                            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <Clock size={24} />
                            </div>
                            <span className="text-lg font-semibold">Start Recording</span>
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 text-white p-6 rounded-xl flex flex-col items-center justify-center border border-white/10 transition-colors">
                            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                <Calendar size={24} />
                            </div>
                            <span className="text-lg font-semibold">Schedule Session</span>
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 text-white p-6 rounded-xl flex flex-col items-center justify-center border border-white/10 transition-colors">
                            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} />
                            </div>
                            <span className="text-lg font-semibold">Browse Recordings</span>
                        </button>
                    </div>
                    
                    {/* Two Column Layout for Recent and Upcoming */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Recordings */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Recent Recordings</h2>
                            <div className="space-y-4">
                                {recentRecordings.map(recording => (
                                    <div key={recording.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-[#fe7f2d]/20 rounded-full flex items-center justify-center">
                                                <Clock size={20} className="text-[#fe7f2d]" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{recording.title}</p>
                                                <p className="text-gray-400 text-sm">{recording.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 text-sm">{recording.duration}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 text-[#fe7f2d] hover:text-[#fe7f2d]/80 font-medium">View all recordings</button>
                        </div>
                        
                        {/* Upcoming Sessions */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
                            <div className="space-y-4">
                                {upcomingSessions.map(session => (
                                    <div key={session.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-[#fe7f2d]/20 rounded-full flex items-center justify-center">
                                                <Calendar size={20} className="text-[#fe7f2d]" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{session.title}</p>
                                                <p className="text-gray-400 text-sm">{session.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 text-sm">{session.time}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 text-[#fe7f2d] hover:text-[#fe7f2d]/80 font-medium">View calendar</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Home;