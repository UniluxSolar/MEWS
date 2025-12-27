import React from 'react';
import {
    FaCheckCircle, FaCalendarAlt, FaMapMarkerAlt, FaQrcode, FaEnvelope, FaTimes
} from 'react-icons/fa';

const RegistrationSuccessModal = ({ onClose, eventTitle, date, location }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full relative overflow-hidden animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
                <FaTimes size={18} />
            </button>

            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short">
                    <FaCheckCircle size={32} />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">You're Registered!</h2>
                <p className="text-xs text-gray-500 mb-6">Your registration for <span className="font-bold text-gray-700">{eventTitle}</span> has been confirmed.</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2 border border-gray-100">
                    <div className="flex items-start gap-3">
                        <FaCalendarAlt className="text-gray-400 mt-0.5" size={12} />
                        <span className="text-xs text-gray-600 font-bold">{date}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-gray-400 mt-0.5" size={12} />
                        <span className="text-xs text-gray-600 font-bold">{location}</span>
                    </div>
                </div>

                <div className="mb-6 flex justify-center">
                    <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <FaQrcode size={120} />
                        <div className="text-[10px] text-gray-400 mt-2 font-mono">ID: 107T</div>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mb-6">Show this QR code at the event registration desk</p>

                <button className="w-full py-2.5 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition shadow-md mb-3">
                    Download QR Code
                </button>
                <div className="flex gap-2">
                    <button className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition">
                        Add to Calendar
                    </button>
                    <button className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition" onClick={onClose}>
                        View My Events
                    </button>
                </div>
            </div>

            <div className="bg-green-50 p-3 text-center border-t border-green-100">
                <p className="text-[10px] text-green-700 font-medium flex items-center justify-center gap-1">
                    <FaEnvelope size={10} /> Confirmation email sent to your registered email
                </p>
            </div>
        </div>
    </div>
);

export default RegistrationSuccessModal;
