import React, { useState } from 'react';
import axios from '../api';
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const OCRConcept = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [extractedData, setExtractedData] = useState({
        fullName: '',
        aadhaarNumber: '',
        dob: '',
        gender: '',
        careOf: '',
        houseNo: '',
        street: '',
        locality: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("File size exceeds 5MB");
                return;
            }
            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
                setError("Invalid file type. Please upload JPG, PNG, or PDF.");
                return;
            }

            setFile(selectedFile);
            setError(null);

            // Create preview
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null); // No preview for PDF currently, or use generic icon
            }

            // Auto-trigger extraction? Requirement said "Automatically trigger OCR after upload"
            handleExtract(selectedFile);
        }
    };

    const handleExtract = async (uploadedFile) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('document', uploadedFile);

        try {
            const response = await axios.post('/ocr/extract', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const data = response.data.data;
                setExtractedData({
                    fullName: data.fullName || '',
                    aadhaarNumber: data.aadhaarNumber || '',
                    dob: data.dob || '',
                    gender: data.gender || '',
                    careOf: data.address?.careOf || '',
                    houseNo: data.address?.houseNo || '',
                    street: data.address?.street || '',
                    locality: data.address?.locality || '',
                    city: data.address?.city || '',
                    district: data.address?.district || '',
                    state: data.address?.state || '',
                    pincode: data.address?.pincode || ''
                });
            }
        } catch (err) {
            console.error("OCR Error:", err);
            const backendMsg = err.response?.data?.message || err.message;
            const backendDetails = err.response?.data?.details;
            setError(backendMsg ? `Error: ${backendMsg} ${backendDetails ? '(' + backendDetails + ')' : ''}` : "Failed to extract details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExtractedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">OCR Concept</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Upload an Aadhaar card to auto-extract details.
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Upload & Preview */}
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                            <FaCloudUploadAlt className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">Click to upload or drag & drop</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                        </div>

                        {error && (
                            <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded">
                                <FaExclamationCircle className="mr-2" />
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center text-blue-600 text-sm bg-blue-50 p-3 rounded">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Extracting Aadhaar details...
                            </div>
                        )}

                        {preview && (
                            <div className="mt-4 border rounded-lg overflow-hidden">
                                <p className="text-xs text-gray-500 p-2 bg-gray-100 border-b">Document Preview</p>
                                <img src={preview} alt="Preview" className="w-full h-auto object-contain max-h-[400px]" />
                            </div>
                        )}
                        {file && !preview && (
                            <div className="mt-4 flex items-center p-4 bg-gray-50 rounded-lg border">
                                <FaFileAlt className="text-gray-400 h-8 w-8 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Form */}
                    <div className="space-y-4">
                        <div className="border-b pb-2 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Extracted Details</h2>
                            <p className="text-xs text-gray-500">Verify and edit the details below</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Full Name</label>
                                <input type="text" name="fullName" value={extractedData.fullName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Aadhaar Number</label>
                                <input type="text" name="aadhaarNumber" value={extractedData.aadhaarNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="XXXX XXXX XXXX" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Date of Birth / YOB</label>
                                    <input type="text" name="dob" value={extractedData.dob} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="DD/MM/YYYY" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Gender</label>
                                    <select name="gender" value={extractedData.gender} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Transgender">Transgender</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t mt-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Address Details</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Care Of</label>
                                    <input type="text" name="careOf" value={extractedData.careOf} onChange={handleInputChange} placeholder="C/O, S/O, D/O" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">House No / Building</label>
                                        <input type="text" name="houseNo" value={extractedData.houseNo} onChange={handleInputChange} placeholder="House No" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Street / Locality</label>
                                        <input type="text" name="street" value={extractedData.street} onChange={handleInputChange} placeholder="Street" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Village / Town</label>
                                        <input type="text" name="locality" value={extractedData.locality} onChange={handleInputChange} placeholder="Village" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Mandal / City</label>
                                        <input type="text" name="city" value={extractedData.city} onChange={handleInputChange} placeholder="City" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">District</label>
                                        <input type="text" name="district" value={extractedData.district} onChange={handleInputChange} placeholder="District" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">State</label>
                                        <input type="text" name="state" value={extractedData.state} onChange={handleInputChange} placeholder="State" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Pincode</label>
                                    <input type="text" name="pincode" value={extractedData.pincode} onChange={handleInputChange} placeholder="PIN Code" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Confirm & Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OCRConcept;
