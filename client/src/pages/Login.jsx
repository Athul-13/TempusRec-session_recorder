import Loader from "../components/Loader";
import { useEffect } from 'react';
import React from 'react';
import { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import logo from '../assets/logo2.png'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { authService } from "../utils/api";
import toast from "react-hot-toast";
import { setCredentials } from "../redux/authSlice";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

    useEffect(() => {
      if (isAuthenticated) {
          navigate('/home');
      }
  }, [isAuthenticated, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
    }, 2000); // 2-second delay

    return () => clearTimeout(timer);
    }, []);

    if(loading){
        return (
            <Loader />
        )
    }

    // Handle form submission
    const handleLoginSubmit = async(e) => {
      e.preventDefault();

      try {
        const data = await authService.login({email, password});
  
        if(data.status === 'inactive') {
          toast.error('User has been restricted from loggin in');
          return;
        }
  
        await dispatch(setCredentials({
          user: {
            id: data._id,
            fullName: data.fullName,
            profilePicture: data.profilePicture,
            phoneNo: data.phoneNo,
            email: data.email,
            role: data.role
          }
        }));

        navigate('/home')
      } catch (err) {
        toast.error(err.response?.data?.message || 'Login failed!')
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target); // Get form data

      try {
        const response = await authService.register(formData);

        if(response.success) {
          toast.success('Signup successful');
          navigate('/')
        } else {
          toast.error(response.message || 'Signup failed')
        }
      } catch (err) {
        console.error(err.response?.data?.message || 'Signup failed')
      }

    };


  return (
    <div className="min-h-screen bg-[#233d4d] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[900px] h-[550px] bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        {/* Forms Container */}
        <div className="absolute inset-0">
          {/* Login Form */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-10 transition-transform duration-700 ease-in-out z-20 ${isLogin ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="w-full max-w-md">
            <div className="flex items-center space-x-2 mb-8">
                <img src={logo} alt="TempusRec Logo" className="h-12" />
            </div>
              <h2 className="text-2xl font-bold text-white mb-8">Welcome Back!</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#fe7f2d] text-white py-3 rounded-lg font-semibold hover:bg-[#fe7f2d]/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </button>
              </form>
            </div>
          </div>

          {/* Register Form */}
          <div className={`absolute bg-[#2E4756] top-0 right-0 w-1/2 h-full flex items-center justify-center p-10 transition-transform duration-700 ease-in-out z-20 ${!isLogin ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="w-full max-w-md">
            <div className="flex items-center space-x-2 mb-8">
                <img src={logo} alt="TempusRec Logo" className="h-12" />
            </div>
              <h2 className="text-2xl font-bold text-white mb-8">Create Account</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                    <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        name="fullName"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                        placeholder="Enter your full name"
                    />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                        placeholder="Enter your email"
                    />
                    </div>
                </div>

                {/* Phone Number */}
                <div>
                    <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="tel"
                        name="tel"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                        placeholder="Enter your phone number"
                    />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="password"
                        name="password"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-transparent"
                        placeholder="Create a password"
                    />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-[#fe7f2d] text-white py-3 rounded-lg font-semibold hover:bg-[#fe7f2d]/90 transition-colors flex items-center justify-center space-x-2"
                >
                    <UserPlus size={20} />
                    <span>Sign Up</span>
                </button>
              </form>

            </div>
          </div>
        </div>

        {/* Sliding Overlay */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-[#fe7f2d] transition-transform duration-700 ease-in-out z-10 ${isLogin ? 'translate-x-1/2' : 'translate-x-0'}`} />

          {/* Overlay Content - Modified to only cover the correct half */}
          <div className="absolute inset-0">
            {/* Left Panel Content - Only visible when on the register side */}
            <div className={`absolute left-0 w-1/2 h-full flex items-center justify-center transition-opacity duration-700 ease-in-out z-30 ${!isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className="text-white text-center px-8">
                <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                <p className="mb-6">Already have an account?</p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="px-8 py-2 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-[#fe7f2d] transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right Panel Content - Only visible when on the login side */}
            <div className={`absolute right-0 w-1/2 h-full flex items-center justify-center transition-opacity duration-700 ease-in-out z-30 ${isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className="text-white text-center px-8">
                <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
                <p className="mb-6">Start your journey with us today!</p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="px-8 py-2 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-[#fe7f2d] transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;