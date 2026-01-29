import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaLock, FaFingerprint, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import mewsLogo from '../assets/mews_main_logo_new.png';
import PopupCarousel from '../components/common/PopupCarousel';

const AdminLoginPage = () => {
    const navigate = useNavigate();

    // Modes: 'MOBILE', 'OTP', 'MPIN', 'LOCKED'
    const [viewMode, setViewMode] = useState('MOBILE');

    // State
    const [mobileNumber, setMobileNumber] = useState('');
    const [savedUser, setSavedUser] = useState(null);
    const [mpin, setMpin] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Default closed, opens on successful login
    const [pendingNavigation, setPendingNavigation] = useState(null); // Store target path
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const otpInputRef = useRef(null); // Ref for auto-focus
    const mpinInputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    // Load Saved User on Mount
    useEffect(() => {
        const storedUser = localStorage.getItem('savedUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Strict Role Check: Only allow ADMIN roles
                const adminRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN'];

                if (parsedUser.mobile && parsedUser.isMpinEnabled && adminRoles.includes(parsedUser.role)) {
                    setSavedUser(parsedUser);
                    setMobileNumber(parsedUser.mobile);
                    setViewMode('MPIN');
                }
            } catch (e) {
                console.error("Failed to parse saved user", e);
                localStorage.removeItem('savedUser');
            }
        }
    }, []);

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

    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        setFeedbackMessage(null);

        if (!mobileNumber || mobileNumber.length !== 10) {
            setFeedbackMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number' });
            return;
        }

        try {
            setLoading(true);
            const { data } = await API.post('/auth/request-otp', { mobile: mobileNumber, userType: 'ADMIN' });
            setOtpSent(true);
            setTimer(60);
            setViewMode('OTP');
            setFeedbackMessage({ type: 'success', text: data.message || 'OTP sent successfully!' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send Verification Code';
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
            const { data } = await API.post('/auth/verify-otp', { mobile: mobileNumber, otp, userType: 'ADMIN' });

            // Check if user is actually an admin
            const adminRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN'];
            if (!adminRoles.includes(data.role)) {
                setFeedbackMessage({ type: 'error', text: 'Access Denied. You are not an Admin.' });
                setLoading(false);
                return;
            }

            handleLoginSuccess(data);
        } catch (err) {
            setFeedbackMessage({ type: 'error', text: err.response?.data?.message || 'Invalid OTP' });
        } finally {
            setLoading(false);
        }
    };

    const handleMpinLogin = async () => {
        if (!mpin || mpin.length !== 4) return;

        try {
            setLoading(true);
            const { data } = await API.post('/auth/login-mpin', {
                identifier: mobileNumber,
                mpin,
                deviceId: getDeviceId()
            });

            // Double check role
            const adminRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN'];
            if (!adminRoles.includes(data.role)) {
                setFeedbackMessage({ type: 'error', text: 'Access Denied. Not an Admin.' });
                // Clear mpin?
                setMpin('');
                return;
            }

            // Login Success
            handleLoginSuccess(data);
        } catch (error) {
            const msg = error.response?.data?.message || 'Login Failed';
            setFeedbackMessage({ type: 'error', text: msg });
            setMpin('');

            if (msg.toLowerCase().includes('locked')) {
                setViewMode('LOCKED');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (data) => {
        localStorage.setItem('adminInfo', JSON.stringify(data));

        // Save User for MPIN next time
        if (data.isMpinEnabled) {
            const userToSave = {
                name: data.name,
                mobile: data.mobileNumber,
                role: data.role,
                photoUrl: data.photoUrl, // Admin might not have photo, okay if null
                isMpinEnabled: true
            };
            localStorage.setItem('savedUser', JSON.stringify(userToSave));

            setPendingNavigation('/admin/dashboard');
        } else {
            // MPIN NOT ENABLED -> Force Setup
            setPendingNavigation('/dashboard/mpin/setup');
        }

        setIsPopupOpen(true); // Open success popup -> triggers nav
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-sans text-gray-800 relative">
            <PopupCarousel
                isOpen={isPopupOpen}
                onClose={() => {
                    setIsPopupOpen(false);
                    if (pendingNavigation) {
                        navigate(pendingNavigation, { replace: true });
                        setPendingNavigation(null);
                    }
                }}
            // No storageKey for login pages to ensure it shows every time
            />

            <div className={`w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-white p-8 sm:p-10 flex flex-col items-center transition-all duration-300 ${isPopupOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>

                {/* Header (Simplified for MPIN View) */}
                {viewMode !== 'MPIN' && (
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[#1e2a4a] rounded-2xl flex items-center justify-center shadow-md mb-4">
                            {mewsLogo ? (
                                <img src={mewsLogo} alt="MEWS" className="w-16 h-16 object-contain" />
                            ) : (
                                <FaUsers className="text-white text-3xl" />
                            )}
                        </div>
                        <h1 className="text-[#1e2a4a] text-2xl font-extrabold tracking-tight">MEWS</h1>
                        <h2 className="text-[#1e2a4a] text-sm font-semibold tracking-wide uppercase mt-1">Admin Portal</h2>
                    </div>
                )}

                {/* Form Section */}
                <div className="w-full space-y-5">

                    {/* --- MPIN MODE (Saved User) --- */}
                    {viewMode === 'MPIN' && savedUser && (
                        <div className="w-full flex flex-col items-center animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
                                {savedUser.photoUrl ? (
                                    <img src={savedUser.photoUrl} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle className="text-6xl text-gray-400" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-[#1e2a4a] mb-1">Welcome, {savedUser.name || 'Admin'}</h2>
                            <p className="text-sm text-gray-500 mb-6">{savedUser.mobile}</p>

                            {/* Error Msg */}
                            {feedbackMessage && <div className="text-red-500 text-xs font-bold mb-4 bg-red-50 px-3 py-2 rounded">{feedbackMessage.text}</div>}

                            <div className="relative w-full mb-6">
                                <input
                                    ref={mpinInputRef}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={mpin}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setMpin(val);
                                    }}
                                    placeholder="Enter MPIN"
                                    className="w-full bg-gray-100/50 border border-gray-200 text-[#1e2a4a] text-3xl tracking-[0.5em] text-center rounded-2xl focus:ring-4 focus:ring-[#1e2a4a]/10 focus:border-[#1e2a4a] block p-5 font-bold transition-all placeholder:text-sm placeholder:tracking-normal placeholder:text-gray-400 outline-none"
                                />
                            </div>

                            <button
                                onClick={handleMpinLogin}
                                disabled={loading}
                                className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mb-4 text-sm"
                            >
                                {loading ? 'Verifying...' : 'Unlock Dashboard'}
                            </button>

                            <div className="flex w-full justify-between items-center text-xs font-semibold text-gray-500 border-t pt-4">
                                <button onClick={() => {
                                    setViewMode('MOBILE');
                                    setFeedbackMessage(null);
                                }} className="hover:text-[#1e2a4a] transition-colors">
                                    Switch Account
                                </button>
                                <button onClick={() => {
                                    setViewMode('MOBILE'); // Revert to OTP for reset
                                    setFeedbackMessage({ type: 'info', text: 'Please login with OTP to reset MPIN' });
                                }} className="hover:text-[#1e2a4a] transition-colors">
                                    Forgot MPIN?
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- MANUAL MPIN MODE --- */}
                    {viewMode === 'MPIN_MANUAL' && (
                        <div className="w-full space-y-5 animate-fade-in">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold text-[#1e2a4a]">Login with MPIN</h2>
                                <p className="text-xs text-gray-400">Enter your registered mobile & MPIN</p>
                            </div>

                            <div className="space-y-4">
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
                                            placeholder="Enter 10-digit number"
                                            className="w-full bg-gray-100 border-none text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block pl-12 p-3.5 placeholder-gray-400 font-medium transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-600 pl-1">MPIN</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-4 text-gray-400" />
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={mpin}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setMpin(val);
                                            }}
                                            placeholder="Enter 4-digit MPIN"
                                            className="w-full bg-gray-100 border-none text-gray-800 text-lg tracking-[0.5em] text-center rounded-lg focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block p-3.5 pl-10 font-bold transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {feedbackMessage && (
                                <div className={`p-3 rounded-lg text-xs font-bold text-center ${feedbackMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {feedbackMessage.text}
                                </div>
                            )}

                            <button
                                onClick={handleMpinLogin}
                                disabled={loading}
                                className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mt-2 text-sm disabled:opacity-70"
                            >
                                {loading ? 'Verifying...' : 'Login'}
                            </button>

                            <button
                                onClick={() => {
                                    setViewMode('MOBILE');
                                    setFeedbackMessage(null);
                                }}
                                className="w-full text-center text-xs text-gray-500 hover:text-[#1e2a4a] mt-2 font-medium"
                            >
                                Login via OTP
                            </button>
                        </div>
                    )}


                    {/* --- MOBILE INPUT MODE --- */}
                    {viewMode === 'MOBILE' && (
                        <>
                            {/* Header Text */}
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold text-[#1e2a4a]">Admin Login</h2>
                            </div>

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
                            {feedbackMessage && (
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
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-300 text-xs">OR</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <button
                                onClick={() => {
                                    setViewMode('MPIN_MANUAL');
                                    setFeedbackMessage(null);
                                }}
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm transition-all transform active:scale-[0.98] text-sm"
                            >
                                Login with MPIN
                            </button>
                        </>
                    )}

                    {/* --- OTP MODE --- */}
                    {viewMode === 'OTP' && (
                        <div className="w-full space-y-5 animate-fade-in">
                            <div className="text-center mb-2">
                                <button onClick={() => setViewMode('MOBILE')} className="absolute left-6 top-8 text-gray-400 hover:text-[#1e2a4a]">
                                    <FaArrowLeft />
                                </button>
                                <h2 className="text-xl font-bold text-[#1e2a4a]">Verification</h2>
                                <p className="text-xs text-gray-400">Enter OTP sent to +91 {mobileNumber}</p>
                            </div>

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
                                    <span className="text-xs text-gray-500 font-medium">Resend Verification Code in {timer}s</span>
                                ) : (
                                    <button
                                        onClick={handleSendOTP}
                                        type="button"
                                        className="text-xs font-bold text-[#1e2a4a] hover:underline"
                                    >
                                        Resend Verification Code
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
                                onClick={() => {
                                    setOtpSent(false);
                                    setViewMode('MOBILE');
                                }}
                                className="w-full text-center text-xs text-gray-500 hover:text-[#1e2a4a] mt-2"
                            >
                                Change Mobile Number
                            </button>
                        </div>
                    )}

                    {/* --- LOCKED MODE --- */}
                    {viewMode === 'LOCKED' && (
                        <div className="w-full flex flex-col items-center animate-fade-in text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <FaLock className="text-3xl text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-red-600 mb-2">Account Locked</h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Too many incorrect attempts. Your account has been temporarily locked for security.
                            </p>
                            <p className="text-xs text-gray-500 mb-8 bg-gray-50 p-3 rounded-lg border">
                                Please try again after 30 minutes or reset your MPIN using OTP.
                            </p>

                            <button
                                onClick={() => {
                                    setViewMode('MOBILE');
                                    setFeedbackMessage({ type: 'info', text: 'Please login with OTP to reset details' });
                                }}
                                className="w-full bg-white border-2 border-[#1e2a4a] text-[#1e2a4a] font-bold py-3.5 rounded-xl transition-all hover:bg-gray-50 text-sm"
                            >
                                Reset via OTP
                            </button>
                        </div>
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
