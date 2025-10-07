// src/components/Upload.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Upload = ({ onFileUpload }) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <motion.label
                htmlFor="file-input"
                className={`flex justify-center w-full h-64 px-4 transition-all duration-300 ease-in-out bg-white border-2 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 border-dashed'} rounded-2xl shadow-sm appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.08)" }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <div className="flex flex-col items-center justify-center space-y-4">
                    <svg className={`w-16 h-16 ${isDragActive ? 'text-blue-500' : 'text-gray-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="text-gray-500 text-lg">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop.
                    </p>
                    <p className="text-sm text-gray-400">CSV, XLSX, or XLS files</p>
                </div>
                <input type="file" id="file-input" className="hidden" onChange={handleChange} accept=".csv, .xlsx, .xls" />
            </motion.label>
        </div>
    );
};

export default Upload;