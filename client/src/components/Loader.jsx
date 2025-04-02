import { Helix } from "ldrs/react";
import 'ldrs/react/Helix.css';
import React from 'react';
import logo from '../assets/logo2.png';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#233d4d] p-4">
      <div className="w-full max-w-xs p-8 rounded-xl shadow-lg border border-white/10 bg-white/5 backdrop-blur-lg text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="TempusRec Logo" className="h-12" />
        </div>
        <div className="flex justify-center">
          <Helix size="80" speed="1.5" color="#fe7f2d" />
        </div>
        <p className="mt-2 text-white/60 text-xs">Connecting to TempusRec servers</p>
      </div>
    </div>
  );
};

export default Loader;