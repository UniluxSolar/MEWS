import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaCloudUploadAlt, FaCheckCircle, FaRedo, FaTrashAlt, FaTimes } from 'react-icons/fa';

const LivePhotoCapture = ({ onCapture, onUpload, isRequired }) => {
    const [mode, setMode] = useState('initial'); // 'initial', 'camera', 'preview', 'uploaded'
    const [imageSrc, setImageSrc] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stream, setStream] = useState(null);

    // Stop camera stream when component unmounts or mode changes
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setMode('camera');
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please allow camera permissions or use upload option.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setImageSrc(dataUrl);
            stopCamera();
            setMode('preview');
        }
    };

    const retakePhoto = () => {
        setImageSrc(null);
        startCamera();
    };

    const confirmPhoto = () => {
        // Here we would upload the captured base64 image
        if (onCapture) onCapture(imageSrc);
        setMode('captured');
    };

    const cancelCamera = () => {
        stopCamera();
        setMode('initial');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulate upload
            setTimeout(() => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageSrc(reader.result);
                    setMode('uploaded');
                    if (onUpload) onUpload(file);
                };
                reader.readAsDataURL(file);
            }, 1000);
        }
    };

    const reset = () => {
        setImageSrc(null);
        setMode('initial');
        if (onCapture) onCapture(null); // Notify parent cleared
    };

    return (
        <div className={`border border-dashed rounded-lg p-6 mb-6 transition-colors duration-300 
            ${(mode === 'captured' || mode === 'uploaded') ? 'border-green-200 bg-green-50/30' : 'border-gray-300 bg-gray-50'}`}>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-gray-800">Live Photo Verification</h4>
                    {isRequired && <span className="text-xs text-red-500 font-semibold">(Required)</span>}
                    <p className="text-xs text-gray-500 mt-1">Ensure clear face visibility, good lighting</p>
                </div>
                {(mode === 'captured' || mode === 'uploaded') ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 animate-fadeIn">
                        <FaCheckCircle /> Verified
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                        <FaCheckCircle className="text-gray-400" /> Pending
                    </span>
                )}
            </div>

            {/* Initial State */}
            {mode === 'initial' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-white">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4">
                        <FaCamera size={24} />
                    </div>
                    <h5 className="font-bold text-gray-700 mb-2">Capture Live Photo</h5>
                    <p className="text-xs text-gray-500 mb-6 text-center">Take a selfie using your webcam <br />or upload a recent photo</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={startCamera}
                            className="px-4 py-2 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2"
                        >
                            <FaCamera /> Use Webcam
                        </button>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            <FaCloudUploadAlt /> Upload Photo
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>
            )}

            {/* Camera View */}
            {mode === 'camera' && (
                <div className="relative bg-black rounded-lg overflow-hidden flex flex-col items-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover transform -scale-x-100"
                    ></video>
                    <div className="absolute bottom-4 flex gap-4">
                        <button
                            onClick={capturePhoto}
                            className="w-12 h-12 bg-white rounded-full border-4 border-gray-200 focus:outline-none hover:bg-gray-100 active:scale-95 transition"
                        ></button>
                        <button
                            onClick={cancelCamera}
                            className="absolute left-16 top-2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
            )}

            {/* Preview State */}
            {mode === 'preview' && (
                <div className="flex flex-col items-center bg-white p-4 rounded-lg border border-gray-200">
                    <img src={imageSrc} alt="Captured" className="w-48 h-48 object-cover rounded-full border-4 border-blue-100 mb-4 transform -scale-x-100" />
                    <div className="flex gap-3">
                        <button
                            onClick={retakePhoto}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <FaRedo /> Retake
                        </button>
                        <button
                            onClick={confirmPhoto}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <FaCheckCircle /> Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmed/Uploaded State */}
            {(mode === 'captured' || mode === 'uploaded') && (
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 shrink-0">
                        <img src={imageSrc} alt="Verification" className={`w-full h-full object-cover ${mode === 'captured' ? 'transform -scale-x-100' : ''}`} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">Photo Verified</p>
                        <p className="text-xs text-gray-500">{mode === 'captured' ? 'Captured via Webcam' : 'Uploaded from Device'}</p>
                    </div>
                    <button
                        onClick={reset}
                        className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                    >
                        <FaTrashAlt /> Remove
                    </button>
                </div>
            )}

        </div>
    );
};

export default LivePhotoCapture;
