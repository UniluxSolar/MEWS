import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaFileAlt, FaClock, FaTrashAlt, FaSpinner } from 'react-icons/fa';

const FileUploader = ({ title, isRequired, onUploadStatusChange, initialStatus = 'Pending', initialFile = null }) => {
    const [status, setStatus] = useState(initialStatus); // 'Pending', 'Uploading', 'Uploaded'
    const [file, setFile] = useState(initialFile);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            uploadFile(selectedFile);
        }
    };

    const uploadFile = (selectedFile) => {
        setStatus('Uploading');

        // Simulate network upload delay
        setTimeout(() => {
            const fileData = {
                name: selectedFile.name,
                date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                size: (selectedFile.size / 1024).toFixed(1) + ' KB'
            };
            setFile(fileData);
            setStatus('Uploaded');
            if (onUploadStatusChange) onUploadStatusChange(title, true);
        }, 1500);
    };

    const handleRemove = () => {
        setFile(null);
        setStatus('Pending');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onUploadStatusChange) onUploadStatusChange(title, false);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    return (
        <div className={`border border-dashed rounded-lg p-6 mb-6 transition-colors duration-300 
            ${status === 'Uploaded' ? 'border-green-200 bg-green-50/30' : 'border-gray-300 bg-gray-50'}`}>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
            />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-gray-800">{title}</h4>
                    {isRequired && <span className="text-xs text-red-500 font-semibold">(Required)</span>}
                </div>
                {status === 'Uploaded' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 animate-fadeIn">
                        <FaCheckCircle /> Uploaded
                    </span>
                ) : status === 'Uploading' ? (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <FaSpinner className="animate-spin" /> Uploading...
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                        <FaClock /> Pending
                    </span>
                )}
            </div>

            {status === 'Uploaded' && file ? (
                <div className="flex items-center gap-4 animate-fadeIn">
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded flex items-center justify-center p-1 relative">
                        <FaFileAlt className="text-gray-300 text-2xl" />
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">Uploaded on {file.date} • {file.size}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={triggerFileSelect}
                            className="px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-white transition flex items-center gap-2"
                        >
                            <FaCloudUploadAlt /> Replace
                        </button>
                        <button
                            onClick={handleRemove}
                            className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 justify-end"
                        >
                            <FaTrashAlt size={10} /> Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={triggerFileSelect}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer rounded-lg p-8 flex flex-col items-center justify-center bg-white group"
                >
                    <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-primary mb-3 transition-colors">
                        {status === 'Uploading' ? <FaSpinner className="animate-spin" size={20} /> : <FaCloudUploadAlt size={20} />}
                    </div>
                    <h5 className="font-bold text-gray-700 mb-1">{status === 'Uploading' ? 'Uploading...' : 'Upload Document'}</h5>
                    <p className="text-xs text-gray-500 mb-4">Click to browse or drag file here</p>
                    <button className="px-4 py-2 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition pointer-events-none">
                        Choose File
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
