
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import API from '../api';
import MpinInput from '../components/common/MpinInput';

const MpinSetup = () => {
    const navigate = useNavigate();
    const [mpin, setMpin] = useState('');
    const [confirmMpin, setConfirmMpin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        setError('');

        if (mpin.length !== 4) {
            setError('MPIN must be exactly 4 digits');
            return;
        }
        if (mpin !== confirmMpin) {
            setError('MPINs do not match');
            return;
        }

        try {
            setLoading(true);
            const deviceId = getDeviceId();
            await API.post('/auth/create-mpin', { mpin, deviceId });
            setSuccess(true);

            // UPDATE LOCAL STORAGE to enable MPIN login next time
            const storedUser = localStorage.getItem('savedUser');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    parsed.isMpinEnabled = true;
                    localStorage.setItem('savedUser', JSON.stringify(parsed));
                } catch (e) { /* ignore */ }
            }

            // Determine redirect path based on role
            let targetPath = '/dashboard'; // Default (Member)

            try {
                // Check for Admin or Institution info
                // Note: Admin login and Institution login both often use 'adminInfo' in this codebase
                // But simplified member login uses 'memberInfo' or 'savedUser'

                const adminInfoRaw = localStorage.getItem('adminInfo');
                const memberInfoRaw = localStorage.getItem('memberInfo');

                let role = 'MEMBER';

                if (adminInfoRaw) {
                    const adminData = JSON.parse(adminInfoRaw);
                    if (adminData.role) role = adminData.role;
                } else if (memberInfoRaw) {
                    const memberData = JSON.parse(memberInfoRaw);
                    if (memberData.role) role = memberData.role;
                }

                // Route based on role
                if (['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN'].includes(role)) {
                    targetPath = '/admin/dashboard';
                } else if (role === 'INSTITUTION') {
                    // Institutions might have a specific dashboard or profile
                    // Based on InstitutionLoginPage, it defaults to /dashboard or redirect query
                    targetPath = '/dashboard';
                }

            } catch (e) {
                console.error("Error determining redirect path:", e);
            }

            setTimeout(() => {
                navigate(targetPath, { replace: true });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create MPIN');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-sans text-gray-800">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center">

                <h2 className="text-2xl font-bold text-[#1e2a4a] mb-2">Set Your MPIN</h2>
                <p className="text-gray-500 text-sm mb-8 text-center">Secure your account with a 4-digit PIN for quick login.</p>

                {error && (
                    <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold text-center mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-emerald-600">
                        <FaCheckCircle className="text-5xl mb-4" />
                        <h3 className="text-xl font-bold">MPIN Set Successfully!</h3>
                    </div>
                ) : (
                    <form onSubmit={handleSetup} className="w-full space-y-6">

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-600 pl-1">Enter 4-digit MPIN</label>
                            <MpinInput
                                value={mpin}
                                onChange={setMpin}
                                length={4}
                                autoFocus={true}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-600 pl-1">Confirm MPIN</label>
                            <MpinInput
                                value={confirmMpin}
                                onChange={setConfirmMpin}
                                length={4}
                                autoFocus={false}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] hover:bg-[#2c3e66] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1e2a4a]/20 transition-all transform active:scale-[0.98] mt-4"
                        >
                            {loading ? 'Setting MPIN...' : 'Set MPIN'}
                        </button>
                    </form>
                )}

                {!success && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 flex items-center text-sm text-gray-500 hover:text-[#1e2a4a]"
                    >
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                )}
            </div>
        </div>
    );
};

export default MpinSetup;
