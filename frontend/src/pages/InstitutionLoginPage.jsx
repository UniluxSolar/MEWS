import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMobileAlt } from 'react-icons/fa';
import mewsLogo from '../assets/mews_main_logo_new.png';
import API from '../api';
import PopupCarousel from '../components/common/PopupCarousel';
import MpinInput from '../components/common/MpinInput';

const InstitutionLoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/dashboard';

    // View Modes: 
    // 'DEFAULT' (MPIN Only)
    // 'CREATE_MPIN_MOBILE' -> 'CREATE_MPIN_OTP' -> 'CREATE_MPIN_SET'
    // 'FORGOT_MPIN_MOBILE' -> 'FORGOT_MPIN_OTP' -> 'FORGOT_MPIN_SET'
    const [viewMode, setViewMode] = useState('DEFAULT');

    // Data
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [mpin, setMpin] = useState('');
    const [confirmMpin, setConfirmMpin] = useState(''); // For collision flow

    // UI
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'error' | 'success', text: string }
    const [timer, setTimer] = useState(0);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Success Popup
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // Refs
    const otpInputRef = useRef(null);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Cleanup feedback on mode change
    useEffect(() => {
        setFeedback(null);
        setMpin('');
        setConfirmMpin('');
        // Don't clear OTP or mobile to preserve state during reset flow
    }, [viewMode]);

    // --- Helpers ---
    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    const handleLoginSuccess = (data) => {
        if (data.role !== 'INSTITUTION') {
            setFeedback({ type: 'error', text: 'Access Denied: Not an Institution Account' });
            return;
        }

        localStorage.setItem('adminInfo', JSON.stringify(data)); // For compatibility if used elsewhere

        // Save for "Remember Me"
        const userToSave = {
            name: data.name,
            mobile: data.mobile,
            role: data.role,
            photoUrl: data.photoUrl,
            isMpinEnabled: true
        };
        localStorage.setItem('savedUser', JSON.stringify(userToSave));

        setPendingNavigation(redirectPath === '/dashboard/profile' ? '/dashboard' : redirectPath);
        setIsPopupOpen(true); // Trigger Success Popup -> Navigation
    };

    // --- API Interactions ---

    // 1. MPIN Login
    // 1. MPIN Login
    const handleMpinLogin = async (explicitMpin = null) => {
        const mpinToUse = explicitMpin || mpin;
        if (!mpinToUse || (mpinToUse.length !== 4 && mpinToUse.length !== 6)) return;

        setLoading(true);
        try {
            const payload = {
                mpin: mpinToUse,
                deviceId: getDeviceId(),
                userType: 'INSTITUTION'
            };

            const { data } = await API.post('/auth/login-mpin', payload);
            handleLoginSuccess(data);
        } catch (error) {
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Login Failed' });
            setMpin('');
        } finally {
            setLoading(false);
        }
    };

    // 2. Send OTP
    const handleSendOtp = async (nextMode) => {
        if (!mobile || mobile.length !== 10) {
            setFeedback({ type: 'error', text: 'Please enter a valid 10-digit mobile number' });
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/request-otp', { mobile, userType: 'INSTITUTION' });
            // Alert removed per user request
            setTimer(60);
            setViewMode(nextMode);
            setFeedback({ type: 'success', text: 'Verification code sent successfully!' });
        } catch (error) {
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP' });
        } finally {
            setLoading(false);
        }
    };

    // 3. Verify OTP
    const handleVerifyOtp = async (nextMode) => {
        if (!otp || otp.length !== 4) {
            setFeedback({ type: 'error', text: 'Please enter 4-digit OTP' });
            return;
        }

        // For BOTH Create and Resetflows, we NEED verify-otp to get the JWT session/cookie.
        // This establishes the secure context for the next step.

        // For Create MPIN, we NEED verify-otp to get the JWT session/cookie.
        localStorage.removeItem('adminInfo');
        setLoading(true);
        try {
            await API.post('/auth/verify-otp', { mobile, otp, userType: 'INSTITUTION' });
            setViewMode(nextMode);
            setFeedback(null);
        } catch (error) {
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Invalid OTP' });
        } finally {
            setLoading(false);
        }
    };

    // 4. Create New MPIN
    const handleCreateMpinSubmit = async () => {
        if (mpin.length !== 4) {
            setFeedback({ type: 'error', text: 'MPIN must be exactly 4 digits' });
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/create-mpin', {
                mpin,
                deviceId: getDeviceId()
            });

            setFeedback({ type: 'success', text: 'Institution MPIN Created! Logging in...' });

            setTimeout(() => {
                handleMpinLogin();
            }, 1000);

        } catch (error) {
            setLoading(false);
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Failed to create MPIN' });
        }
    };

    // 5. Reset MPIN
    const handleResetMpinSubmit = async () => {
        if (!otp || otp.length !== 4) {
            setFeedback({ type: 'error', text: 'Please enter the 4-digit verification code' });
            return;
        }
        if (mpin !== confirmMpin) {
            setFeedback({ type: 'error', text: 'MPINs do not match' });
            return;
        }
        setLoading(true);
        try {
            await API.post('/auth/reset-mpin', {
                newMpin: mpin,
                deviceId: getDeviceId(),
                userType: 'INSTITUTION'
            });

            setFeedback({ type: 'success', text: 'MPIN reset successfully. Please login.' });
            setTimeout(() => {
                setViewMode('DEFAULT');
                setMpin('');
            }, 2000);

        } catch (error) {
            setLoading(false);
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Failed to reset MPIN' });
        }
    };


    // --- Render Components ---

    const LogoHeader = () => (
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#1e2a4a] rounded-2xl flex items-center justify-center shadow-md mb-4">
                <img src={mewsLogo} alt="MEWS" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-[#1e2a4a] text-2xl font-extrabold tracking-tight">MEWS</h1>
            <p className="text-[#1e2a4a] text-xs font-bold uppercase tracking-wider mt-1">Institution Login</p>
        </div>
    );

    const FeedbackDisplay = () => (
        feedback && (
            <div className={`mb-4 p-3 rounded-lg text-xs font-bold text-center ${feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {feedback.text}
            </div>
        )
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-sans text-gray-800 relative">

            {/* Success Popup Navigation Handler */}
            <PopupCarousel
                isOpen={isPopupOpen}
                onClose={() => {
                    setIsPopupOpen(false);
                    if (pendingNavigation) navigate(pendingNavigation, { replace: true });
                }}
            />

            <div className={`w-full max-w-[400px] bg-white rounded-3xl shadow-xl border border-white p-8 transition-all duration-300 relative z-10 ${isPopupOpen ? 'blur-sm pointer-events-none' : ''}`}>

                {/* 1. DEFAULT VIEW (MPIN ONLY) */}
                {viewMode === 'DEFAULT' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <LogoHeader />
                        {FeedbackDisplay()}

                        <div className="w-full mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Enter Institution MPIN</label>
                            <MpinInput
                                value={mpin}
                                onChange={setMpin}
                                length={4}
                            />
                        </div>

                        <button
                            onClick={() => handleMpinLogin()}
                            disabled={loading || mpin.length !== 4}
                            className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mb-6 disabled:opacity-70 disabled:transform-none"
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </button>

                        <div className="flex w-full justify-between items-center text-xs font-semibold text-gray-500 border-t pt-5">
                            <button onClick={() => setViewMode('CREATE_MPIN_MOBILE')} className="hover:text-[#1e2a4a] transition-colors">
                                Create New MPIN
                            </button>
                            <button onClick={() => setViewMode('FORGOT_MPIN_MOBILE')} className="hover:text-[#1e2a4a] transition-colors">
                                Forgot MPIN?
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. CREATE / FORGOT FLOWS - STEP 1: MOBILE */}
                {(viewMode === 'CREATE_MPIN_MOBILE' || viewMode === 'FORGOT_MPIN_MOBILE') && (
                    <div className="animate-fade-in">
                        <button onClick={() => setViewMode('DEFAULT')} className="absolute left-6 top-8 text-gray-400 hover:text-[#1e2a4a]">
                            <FaArrowLeft />
                        </button>
                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-xl font-bold text-[#1e2a4a]">
                                {viewMode === 'CREATE_MPIN_MOBILE' ? 'Create Institution MPIN' : 'Reset Institution MPIN'}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Enter registered mobile number</p>
                        </div>
                        {FeedbackDisplay()}

                        <div className="space-y-4 mb-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-bold text-sm">+91</span>
                                </div>
                                <input
                                    autoFocus
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setMobile(val);
                                    }}
                                    placeholder="Enter 10-digit number"
                                    className="w-full bg-gray-100 border-none text-gray-800 text-lg rounded-xl focus:ring-2 focus:ring-[#1e2a4a] block pl-12 p-3.5 font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const next = viewMode === 'CREATE_MPIN_MOBILE' ? 'CREATE_MPIN_OTP' : 'FORGOT_MPIN_OTP';
                                handleSendOtp(next);
                            }}
                            disabled={loading || mobile.length !== 10}
                            className="w-full bg-[#1e2a4a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </div>
                )}

                {/* 4. CREATE / FORGOT FLOWS - STEP 2: OTP */}
                {(viewMode === 'CREATE_MPIN_OTP' || viewMode === 'FORGOT_MPIN_OTP') && (
                    <div className="animate-fade-in">
                        <button
                            onClick={() => setViewMode(viewMode === 'CREATE_MPIN_OTP' ? 'CREATE_MPIN_MOBILE' : 'FORGOT_MPIN_MOBILE')}
                            className="absolute left-6 top-8 text-gray-400 hover:text-[#1e2a4a]"
                        >
                            <FaArrowLeft />
                        </button>
                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-xl font-bold text-[#1e2a4a]">Verify OTP</h2>
                            <p className="text-xs text-gray-400 mt-1">Sent to +91 {mobile}</p>
                        </div>
                        {FeedbackDisplay()}

                        <div className="mb-6">
                            <input
                                autoFocus
                                ref={otpInputRef}
                                type="text"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="X X X X"
                                className="w-full bg-gray-100 border-none text-gray-800 text-2xl tracking-[0.5em] text-center rounded-xl focus:ring-2 focus:ring-[#1e2a4a] block p-3.5 font-bold transition-all outline-none"
                            />
                            <div className="text-right mt-2">
                                {timer > 0 ? (
                                    <span className="text-xs text-gray-500 font-medium">Resend in {timer}s</span>
                                ) : (
                                    <button
                                        onClick={() => handleSendOtp(viewMode)}
                                        className="text-xs font-bold text-[#1e2a4a] hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const next = viewMode === 'CREATE_MPIN_OTP' ? 'CREATE_MPIN_SET' : 'FORGOT_MPIN_SET';
                                handleVerifyOtp(next);
                            }}
                            disabled={loading || otp.length !== 4}
                            className="w-full bg-[#1e2a4a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                        >
                            {loading ? 'Verifying...' : 'Verify & Proceed'}
                        </button>
                    </div>
                )}

                {/* 5. CREATE / FORGOT FLOWS - STEP 3: SET MPIN */}
                {(viewMode === 'CREATE_MPIN_SET' || viewMode === 'FORGOT_MPIN_SET') && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-xl font-bold text-[#1e2a4a]">
                                {viewMode === 'CREATE_MPIN_SET' ? 'Set New MPIN' : 'Reset MPIN'}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Create a secure 4-digit PIN</p>
                        </div>
                        {FeedbackDisplay()}

                        <div className="space-y-6 mb-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">New 4-Digit MPIN</label>
                                <MpinInput
                                    value={mpin}
                                    onChange={setMpin}
                                    length={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm MPIN</label>
                                <MpinInput
                                    value={confirmMpin}
                                    onChange={setConfirmMpin}
                                    length={4}
                                    autoFocus={false}
                                />
                            </div>
                        </div>

                        <button
                            onClick={viewMode === 'CREATE_MPIN_SET' ? handleCreateMpinSubmit : handleResetMpinSubmit}
                            disabled={loading || mpin.length !== 4 || confirmMpin !== mpin}
                            className="w-full bg-[#1e2a4a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                        >
                            {loading ? 'Saving...' : 'Save MPIN'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InstitutionLoginPage;
