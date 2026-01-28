import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaLock, FaFingerprint, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import mewsLogo from '../assets/mews_main_logo_new.png';
import API from '../api';
import CarouselModal from '../components/common/CarouselModal'; // Replaced

const LoginPage = () => {
    const navigate = useNavigate();

    // Modes: 'MOBILE', 'OTP', 'MPIN', 'LOCKED', 'FORGOT_MPIN'
    const [viewMode, setViewMode] = useState('MOBILE');

    // User Data
    const [savedUser, setSavedUser] = useState(null);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [mpin, setMpin] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [timer, setTimer] = useState(0);
    const otpInputRef = useRef(null);
    const mpinInputRef = useRef(null);

    // Load Saved User on Mount
    useEffect(() => {
        const storedUser = localStorage.getItem('savedUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.mobile && parsedUser.isMpinEnabled) {
                    setSavedUser(parsedUser);
                    setMobile(parsedUser.mobile);
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
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // --- Actions ---

    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    const handleSendOTP = async () => {
        setFeedbackMessage(null);
        if (!mobile || mobile.length !== 10) {
            setFeedbackMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number' });
            return;
        }

        try {
            setLoading(true);
            const { data } = await API.post('/auth/request-otp', { mobile, userType: 'MEMBER' }); // Assuming MEMBER default, logic handles lookup
            setTimer(60);
            setViewMode('OTP');
            setFeedbackMessage({ type: 'success', text: data.message || 'OTP sent successfully!' });
        } catch (error) {
            setFeedbackMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            const { data } = await API.post('/auth/verify-otp', { mobile, otp, userType: 'MEMBER' });

            // Login Success
            handleLoginSuccess(data);
        } catch (error) {
            setFeedbackMessage({ type: 'error', text: error.response?.data?.message || 'Invalid OTP' });
        } finally {
            setLoading(false);
        }
    };

    const handleMpinLogin = async () => {
        if (!mpin || mpin.length !== 4) return;

        try {
            setLoading(true);
            const { data } = await API.post('/auth/login-mpin', {
                identifier: mobile,
                mpin,
                deviceId: getDeviceId()
            });

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
        // Save Token & User Info
        localStorage.setItem('adminInfo', JSON.stringify(data));
        localStorage.setItem('memberInfo', JSON.stringify(data));

        // Logic for Redirection & Saving Credentials
        if (viewMode === 'MPIN') {
            // Already using MPIN, just refresh saved user data
            const userToSave = {
                name: data.name,
                mobile: data.mobileNumber,
                role: data.role,
                photoUrl: data.photoUrl,
                isMpinEnabled: true
            };
            localStorage.setItem('savedUser', JSON.stringify(userToSave));

            // Navigate to Dashboard
            const target = (data.role === 'MEMBER' || data.role === 'INSTITUTION') ? '/member-dashboard' : '/admin-dashboard';
            navigate(target, { replace: true });

        } else {
            // OTP LOGIN FLOW
            if (data.isMpinEnabled) {
                // MPIN is enabled, save user for next time
                const userToSave = {
                    name: data.name,
                    mobile: data.mobileNumber,
                    role: data.role,
                    photoUrl: data.photoUrl,
                    isMpinEnabled: true
                };
                localStorage.setItem('savedUser', JSON.stringify(userToSave));

                // Navigate to Dashboard
                const target = (data.role === 'MEMBER' || data.role === 'INSTITUTION') ? '/member-dashboard' : '/admin-dashboard';
                navigate(target, { replace: true });

            } else {
                // MPIN NOT ENABLED -> Force Setup
                navigate('/mpin/setup', { replace: true });
            }
        }
    };

    // --- Render Helpers ---

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-sans text-gray-800 relative">
            <CarouselModal />

            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-white p-8 sm:p-10 flex flex-col items-center transition-all duration-300 relative z-10">

                {/* Header / Logo (Show only in MOBILE or OTP mode usually, simplified for MPIN) */}
                {viewMode !== 'MPIN' && (
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[#1e2a4a] rounded-2xl flex items-center justify-center shadow-md mb-4">
                            {mewsLogo ? <img src={mewsLogo} alt="MEWS" className="w-16 h-16 object-contain" /> : <FaUsers className="text-white text-3xl" />}
                        </div>
                        <h1 className="text-[#1e2a4a] text-2xl font-extrabold tracking-tight">MEWS</h1>
                        <p className="text-gray-500 text-xs mt-1">Community Support at Your Fingertips</p>
                    </div>
                )}

                {/* --- MPIN MODE --- */}
                {viewMode === 'MPIN' && savedUser && (
                    <div className="w-full flex flex-col items-center animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
                            {savedUser.photoUrl ? (
                                <img src={savedUser.photoUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <FaUserCircle className="text-6xl text-gray-400" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-[#1e2a4a] mb-1">Welcome, {savedUser.name}</h2>
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
                            {loading ? 'Verifying...' : 'Unlock'}
                        </button>

                        <button className="flex items-center justify-center gap-2 text-gray-400 hover:text-[#1e2a4a] text-sm font-medium mb-8 transition-colors">
                            <FaFingerprint className="text-lg" /> Use Biometric
                        </button>

                        <div className="flex w-full justify-between items-center text-xs font-semibold text-gray-500 border-t pt-4">
                            <button onClick={() => {
                                setViewMode('MOBILE');
                                setFeedbackMessage(null);
                            }} className="hover:text-[#1e2a4a] transition-colors">
                                Switch Account
                            </button>
                            <button onClick={() => {
                                setViewMode('MOBILE');
                                setFeedbackMessage({ type: 'info', text: 'Please login with OTP to reset MPIN' });
                            }} className="hover:text-[#1e2a4a] transition-colors">
                                Forgot MPIN?
                            </button>
                        </div>
                    </div>
                )}

                {/* --- MOBILE INPUT MODE --- */}
                {viewMode === 'MOBILE' && (
                    <div className="w-full space-y-5 animate-fade-in">
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-bold text-[#1e2a4a]">Member Login</h2>
                            <p className="text-xs text-gray-400">Enter your mobile number to proceed</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-600 pl-1">Mobile Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setMobile(val);
                                    }}
                                    placeholder="Enter 10-digit number"
                                    className="w-full bg-gray-100 border-none text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block pl-12 p-3.5 placeholder-gray-400 font-medium transition-all outline-none"
                                />
                            </div>
                        </div>

                        {feedbackMessage && (
                            <div className={`p-3 rounded-lg text-xs font-bold text-center ${feedbackMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {feedbackMessage.text}
                            </div>
                        )}

                        <button
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mt-2 text-sm disabled:opacity-70"
                        >
                            {loading ? 'Sending...' : 'Get OTP'}
                        </button>
                    </div>
                )}

                {/* --- OTP MODE --- */}
                {viewMode === 'OTP' && (
                    <div className="w-full space-y-5 animate-fade-in">
                        <div className="text-center mb-2">
                            <button onClick={() => setViewMode('MOBILE')} className="absolute left-6 top-8 text-gray-400 hover:text-[#1e2a4a]">
                                <FaArrowLeft />
                            </button>
                            <h2 className="text-xl font-bold text-[#1e2a4a]">Verification</h2>
                            <p className="text-xs text-gray-400">Enter OTP sent to +91 {mobile}</p>
                        </div>

                        {feedbackMessage && (
                            <div className={`p-3 rounded-lg text-xs font-bold text-center ${feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {feedbackMessage.text}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <input
                                ref={otpInputRef}
                                type="text"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="X X X X"
                                className="w-full bg-gray-100 border-none text-gray-800 text-lg tracking-[1em] text-center rounded-lg focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block p-3.5 font-bold transition-all outline-none"
                            />
                        </div>

                        <div className="text-right">
                            {timer > 0 ? (
                                <span className="text-xs text-gray-500 font-medium">Resend in {timer}s</span>
                            ) : (
                                <button onClick={handleSendOTP} className="text-xs font-bold text-[#1e2a4a] hover:underline">
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleVerifyOTP}
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mt-2 text-sm disabled:opacity-70"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
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
                                setViewMode('MOBILE'); // Go to OTP flow to reset
                                setFeedbackMessage({ type: 'info', text: 'Please login with OTP to reset details' });
                            }}
                            className="w-full bg-white border-2 border-[#1e2a4a] text-[#1e2a4a] font-bold py-3.5 rounded-xl transition-all hover:bg-gray-50 text-sm"
                        >
                            Reset via OTP
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center space-y-2">
                    <div className="flex gap-3 justify-center text-[10px] text-[#1e2a4a]/60 font-medium">
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <span>•</span>
                        <a href="#" className="hover:underline">Terms of Service</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
