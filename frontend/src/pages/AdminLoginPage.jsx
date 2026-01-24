import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import mewsLogo from '../assets/mews_main_logo_new.png';

const AdminLoginPage = () => {
    const navigate = useNavigate();

    // OTP State
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const otpInputRef = useRef(null); // Ref for auto-focus

    const [loading, setLoading] = useState(false);

    // Timer Effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Auto-focus Effect
    useEffect(() => {
        if (otpSent && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [otpSent]);

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        setFeedbackMessage(null);

        if (!mobileNumber || mobileNumber.length !== 10) {
            setFeedbackMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number' });
            return;
        }

        try {
            setLoading(true);
            // Use userType='MEMBER' because Admins are promoted Members
            const { data } = await API.post('/auth/request-otp', { mobile: mobileNumber, userType: 'MEMBER' });
            setOtpSent(true);
            setTimer(60);
            setFeedbackMessage({ type: 'success', text: data.message || 'OTP sent successfully!' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send OTP';
            setFeedbackMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedbackMessage(null);
        try {
            const { data } = await API.post('/auth/verify-otp', { mobile: mobileNumber, otp, userType: 'MEMBER' });

            // Check if user is actually an admin
            const adminRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'];
            if (!adminRoles.includes(data.role)) {
                setFeedbackMessage({ type: 'error', text: 'Access Denied. You are not an Admin.' });
                setLoading(false);
                return;
            }

            localStorage.setItem('adminInfo', JSON.stringify(data));
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setFeedbackMessage({ type: 'error', text: err.response?.data?.message || 'Invalid OTP' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-sans text-gray-800">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-white p-8 sm:p-10 flex flex-col items-center">

                {/* Logo Section */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#1e2a4a] rounded-2xl flex items-center justify-center shadow-md mb-4">
                        {/* Use img if available, else icon */}
                        {mewsLogo ? (
                            <img src={mewsLogo} alt="MEWS" className="w-16 h-16 object-contain" />
                        ) : (
                            <FaUsers className="text-white text-3xl" />
                        )}
                    </div>
                    <h1 className="text-[#1e2a4a] text-2xl font-extrabold tracking-tight">MEWS</h1>
                    <h2 className="text-[#1e2a4a] text-sm font-semibold tracking-wide uppercase mt-1">Mala Educational Welfare Society</h2>
                    <p className="text-gray-500 text-xs mt-1">Community Support at Your Fingertips</p>
                </div>

                {/* Form Section */}
                <div className="w-full space-y-5">
                    {/* Admin Login Header */}
                    <div className="text-center mb-2">
                        <h2 className="text-xl font-bold text-[#1e2a4a]">Admin Login</h2>
                    </div>

                    {!otpSent ? (
                        <>
                            {/* Mobile Input */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-600 pl-1">Mobile Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-medium">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setMobileNumber(val);
                                        }}
                                        placeholder="Enter 10-digit mobile number"
                                        className="w-full bg-gray-100 border-none text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block pl-12 p-3.5 placeholder-gray-400 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* Feedback Message (Mobile Screen) */}
                            {feedbackMessage && !otpSent && (
                                <div className={`p-3 rounded-lg text-xs font-bold text-center mb-2 ${feedbackMessage.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}>
                                    {feedbackMessage.text}
                                </div>
                            )}

                            {/* Send OTP Button */}
                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mt-2 text-sm disabled:opacity-70"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Feedback Message */}
                            {feedbackMessage && (
                                <div className={`p-3 rounded-lg text-xs font-bold text-center mb-2 ${feedbackMessage.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}>
                                    {feedbackMessage.text}
                                </div>
                            )}

                            {/* OTP Input */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-600 pl-1">Enter OTP</label>
                                <input
                                    ref={otpInputRef}
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 4-digit OTP"
                                    maxLength={4}
                                    className="w-full bg-gray-100 border-none text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block p-3.5 placeholder-gray-400 font-medium transition-all text-center tracking-widest text-lg"
                                />
                            </div>

                            {/* Resend Timer / Button */}
                            <div className="text-right">
                                {timer > 0 ? (
                                    <span className="text-xs text-gray-500 font-medium">Resend OTP in {timer}s</span>
                                ) : (
                                    <button
                                        onClick={handleSendOTP}
                                        type="button"
                                        className="text-xs font-bold text-[#1e2a4a] hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mt-2 text-sm disabled:opacity-70"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>

                            <button
                                onClick={() => setOtpSent(false)}
                                className="w-full text-center text-xs text-gray-500 hover:text-[#1e2a4a] mt-2"
                            >
                                Change Mobile Number
                            </button>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-10 text-center space-y-2">
                    <p className="text-[10px] text-gray-300 font-medium">Version 1.0.2</p>
                    <div className="flex gap-3 justify-center text-[10px] text-[#1e2a4a] font-medium">
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <span>•</span>
                        <a href="#" className="hover:underline">Terms of Service</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminLoginPage;
