import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import LoginLayout from '../components/auth/LoginLayout';
import CarouselModal from '../components/common/CarouselModal';

const InputField = ({ label, icon: Icon, suffixIcon: SuffixIcon, onSuffixClick, ...props }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-[#1e2a4a] uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1e2a4a] transition-colors">
                <Icon size={16} />
            </div>
            <input
                {...props}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1e2a4a]/10 focus:bg-white text-gray-800 text-base rounded-2xl block pl-12 pr-12 p-4 font-bold transition-all outline-none focus:ring-4 focus:ring-[#1e2a4a]/5"
            />
            {SuffixIcon && (
                <button
                    type="button"
                    onClick={onSuffixClick}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#1e2a4a] transition-colors"
                >
                    <SuffixIcon size={18} />
                </button>
            )}
        </div>
    </div>
);

const Feedback = ({ feedback }) => feedback && (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl flex items-start gap-3 ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
    >
        {feedback.type === 'error' ? <FaExclamationCircle className="mt-0.5 shrink-0" /> : <FaCheckCircle className="mt-0.5 shrink-0" />}
        <p className="text-xs font-bold leading-relaxed">{feedback.text}</p>
    </motion.div>
);

const AdminLoginPage = () => {
    const navigate = useNavigate();

    // View Modes: 'LOGIN', 'FORGOT', 'RESET'
    const [viewMode, setViewMode] = useState('LOGIN');

    // Data
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLoginSuccess = (data) => {
        const adminRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN'];
        if (!adminRoles.includes(data.role)) {
            setFeedback({ type: 'error', text: 'Access Denied: Not an Admin Account' });
            return;
        }

        localStorage.setItem('adminInfo', JSON.stringify(data));
        localStorage.setItem('memberInfo', JSON.stringify(data));

        const userToSave = {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            memberType: data.memberType
        };
        localStorage.setItem('savedUser', JSON.stringify(userToSave));

        const target = (data.role === 'MEMBER' || data.role === 'INSTITUTION') ? '/dashboard' : '/admin/dashboard';
        navigate(target, { replace: true });
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        if (!username || !password) {
            setFeedback({ type: 'error', text: 'Enter your credentials' });
            return;
        }

        setLoading(true);
        setFeedback(null);
        try {
            const { data } = await API.post('/auth/login', { username, password });
            handleLoginSuccess(data);
        } catch (error) {
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Invalid Credentials' });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!username) {
            setFeedback({ type: 'error', text: 'Registered identifier required' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post('/auth/forgot-password', { loginInput: username });
            setFeedback({ type: 'success', text: data.message });
            setViewMode('RESET');
        } catch (error) {
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Failed code delivery' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        if (!resetCode || !newPassword) {
            setFeedback({ type: 'error', text: 'All fields required' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post('/auth/reset-password', { loginInput: username, resetCode, newPassword });
            setFeedback({ type: 'success', text: data.message });
            setTimeout(() => {
                setViewMode('LOGIN');
                setFeedback(null);
                setResetCode('');
                setNewPassword('');
            }, 2000);
        } catch (error) {
            setFeedback({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginLayout
            title="Admin Portal"
            subtitle="Internal management & oversight"
            footerLink={viewMode === 'LOGIN' ? 'First Time Login / Forgot Password?' : 'Back to Login'}
            onFooterClick={() => {
                setViewMode(viewMode === 'LOGIN' ? 'FORGOT' : 'LOGIN');
                setFeedback(null);
                setShowPassword(false);
            }}
        >
            <CarouselModal />

            <AnimatePresence mode="wait">
                {viewMode === 'LOGIN' && (
                    <motion.form
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleLogin}
                        className="space-y-6"
                    >
                        <InputField
                            label="Username"
                            icon={FaUser}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Email or Mobile Number"
                        />
                        <InputField
                            label="Password"
                            icon={FaLock}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            suffixIcon={showPassword ? FaEyeSlash : FaEye}
                            onSuffixClick={() => setShowPassword(!showPassword)}
                        />

                        <Feedback feedback={feedback} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </motion.form>
                )}

                {viewMode === 'FORGOT' && (
                    <motion.form
                        key="forgot"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleForgotPassword}
                        className="space-y-6"
                    >
                        <InputField
                            label="Registered Email / Mobile"
                            icon={FaShieldAlt}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="To receive a verification code"
                        />

                        <Feedback feedback={feedback} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Sending Code...' : 'Send Verification Code'}
                        </button>
                    </motion.form>
                )}

                {viewMode === 'RESET' && (
                    <motion.form
                        key="reset"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleResetPassword}
                        className="space-y-6"
                    >
                        <div className="text-center mb-4">
                            <p className="text-xs text-blue-600 font-bold bg-blue-50 py-2 rounded-lg">Verification code sent to your registered email</p>
                        </div>
                        <InputField
                            label="Verification Code"
                            icon={FaShieldAlt}
                            type="text"
                            maxLength={4}
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            placeholder="X X X X"
                        />
                        <InputField
                            label="Set New Password"
                            icon={FaLock}
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            suffixIcon={showPassword ? FaEyeSlash : FaEye}
                            onSuffixClick={() => setShowPassword(!showPassword)}
                        />

                        <Feedback feedback={feedback} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e2a4a] text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Password & Continue'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </LoginLayout>
    );
};

export default AdminLoginPage;
