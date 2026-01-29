
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaUserCircle, FaFingerprint } from 'react-icons/fa';
import API from '../api';

const MpinLogin = () => {
    const navigate = useNavigate();
    const [mpin, setMpin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState({ name: 'User', mobile: '' });

    // Forgot MPIN State
    const [showForgot, setShowForgot] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [newMpin, setNewMpin] = useState('');
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        // Try to identify user from localStorage or params
        // Ideally, we persist some user info on logout if we want "Quick Login"
        // Or we rely on mobile number input if completely logged out.
        // For this flow, let's assume we prompt for Mobile Number if not known,
        // OR we store 'lastUser' in localStorage.

        const lastUser = JSON.parse(localStorage.getItem('lastUser') || '{}');
        if (lastUser && lastUser.mobile) {
            setUser(lastUser);
        }
    }, []);

    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (mpin.length !== 4) return;

        try {
            setLoading(true);
            const { data } = await API.post('/auth/login-mpin', {
                identifier: user.mobile, // Assuming we know the mobile
                mpin,
                deviceId: getDeviceId()
            });

            // Login Success
            localStorage.setItem('adminInfo', JSON.stringify(data));
            localStorage.setItem('memberInfo', JSON.stringify(data)); // Legacy support maybe?

            // Redirect based on role
            // Redirect based on role
            if (data.role === 'MEMBER' || data.role === 'INSTITUTION') navigate('/dashboard');
            else navigate('/admin/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Login Failed');
            setMpin(''); // Clear MPIN on error
        } finally {
            setLoading(false);
        }
    };

    const handleForgotMpin = async () => {
        if (!user.mobile) {
            setError('Mobile number required for reset');
            return;
        }
        try {
            setLoading(true);
            await API.post('/auth/forgot-mpin', { mobile: user.mobile, userType: 'MEMBER' }); // Assuming Member for now or Generic
            setOtpSent(true);
            setTimer(60);
            setError(''); // Clear errors
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetMpin = async () => {
        try {
            setLoading(true);
            await API.post('/auth/reset-mpin', {
                mobile: user.mobile,
                otp,
                newMpin,
                deviceId: getDeviceId()
            });
            // Success - Reset State
            setOtpSent(false);
            setShowForgot(false);
            setOtp('');
            setNewMpin('');
            setError('');
            alert('MPIN Reset Successfully. Please login.');
        } catch (err) {
            setError(err.response?.data?.message || 'Reset Failed');
        } finally {
            setLoading(false);
        }
    };

    // If we don't know the mobile, we can't do MPIN login effectively without asking for it first.
    // If user.mobile is empty, show Mobile Input screen? Or just redirect to standard login.
    if (!user.mobile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">No recent user found.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-[#1e2a4a] text-white px-6 py-2 rounded-lg"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-sans text-gray-800">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center">

                <div className="mb-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        {/* Show User Photo if available in local storage otherwise icon */}
                        <FaUserCircle className="text-5xl text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e2a4a]">Welcome Back, {user.name}</h2>
                    <p className="text-sm text-gray-500">{user.mobile}</p>
                </div>

                {error && (
                    <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold text-center mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                {showForgot ? (
                    <div className="w-full space-y-4 animate-fade-in">
                        <h3 className="text-center font-bold text-[#1e2a4a]">Reset MPIN</h3>

                        {!otpSent ? (
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-4">We will send an OTP to {user.mobile}</p>
                                <button onClick={handleForgotMpin} disabled={loading} className="w-full bg-[#1e2a4a] text-white py-3 rounded-xl font-bold">
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-gray-100 p-3 rounded-lg text-center font-bold tracking-widest"
                                />
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    placeholder="New 4-digit MPIN"
                                    value={newMpin}
                                    onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full bg-gray-100 p-3 rounded-lg text-center font-bold tracking-widest"
                                />
                                <button onClick={handleResetMpin} disabled={loading} className="w-full bg-[#1e2a4a] text-white py-3 rounded-xl font-bold">
                                    {loading ? 'Resetting...' : 'Set New MPIN'}
                                </button>
                            </>
                        )}
                        <button onClick={() => setShowForgot(false)} className="w-full text-center text-xs text-gray-500 mt-2">Cancel</button>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                inputMode="numeric"
                                value={mpin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setMpin(val);
                                }}
                                placeholder="Enter MPIN"
                                className="w-full bg-gray-100 border-none text-gray-800 text-2xl tracking-[0.5em] text-center rounded-xl focus:ring-2 focus:ring-[#1e2a4a] focus:bg-white block p-4 font-bold transition-all placeholder:text-sm placeholder:tracking-normal"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98]"
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </button>

                        <div className="flex justify-between text-xs font-semibold text-gray-500 mt-4 px-2">
                            <button onClick={() => setShowForgot(true)} className="hover:text-[#1e2a4a]">Forgot MPIN?</button>
                            <button onClick={() => navigate('/login')} className="hover:text-[#1e2a4a]">Login with OTP</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MpinLogin;
