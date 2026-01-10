import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaEye, FaEyeSlash, FaChevronDown } from 'react-icons/fa';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
    const [showPassword, setShowPassword] = useState(false);

    // Credentials State
    const [credentials, setCredentials] = useState({ username: '', password: '', role: 'VILLAGE_ADMIN' });
    const [mobileNumber, setMobileNumber] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // NOTE: In a real app, you would handle OTP login separately here.
            // Keeping existing password login logic for now as requested "functionality should be as it is".
            if (loginMethod === 'otp') {
                setError("OTP Login functionality is currently disabled for security.");
                setLoading(false);
                return;
            }

            const { data } = await API.post('/auth/login', credentials);
            localStorage.setItem('adminInfo', JSON.stringify(data));
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] font-sans px-4">

            {/* Card Container */}
            <div className="max-w-[420px] w-full bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#274472] rounded-xl flex items-center justify-center text-white text-2xl mb-4 shadow-md">
                        <FaUsers />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1e2a4a] mb-1">MEWS</h1>
                    <p className="text-sm font-medium text-gray-800 text-center">Mala Educational Welfare Society</p>
                    <p className="text-xs text-gray-500 mt-1">Community Support at Your Fingertips</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded-lg">{error}</div>}

                    {/* Role Selector (Preserved Functionality) */}
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block ml-1">Select Role</label>
                        <div className="relative">
                            <select
                                name="role"
                                value={credentials.role}
                                onChange={handleChange}
                                className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#274472] appearance-none border-0 transition-all font-medium"
                            >
                                <option value="VILLAGE_ADMIN">Village Admin</option>
                                <option value="MANDAL_ADMIN">Mandal Admin</option>
                                <option value="DISTRICT_ADMIN">District Admin</option>
                                <option value="STATE_ADMIN">State Admin</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                        </div>
                    </div>

                    {loginMethod === 'password' ? (
                        <>
                            {/* Username Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1.5 block ml-1">User Name/ID</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    placeholder="Enter user name or ID"
                                    className="w-full bg-gray-100 text-gray-800 text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#274472] transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1.5 block ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className="w-full bg-gray-100 text-gray-800 text-sm rounded-lg px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#274472] transition-all placeholder:text-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center ml-1">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="w-4 h-4 text-[#274472] bg-gray-100 border-gray-300 rounded focus:ring-[#274472] focus:ring-2"
                                />
                                <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-gray-600">Remember me</label>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-[#274472] text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-[#1a335d] hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Mobile Number Input (OTP Mode) */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1.5 block ml-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="Enter your mobile number"
                                    className="w-full bg-gray-100 text-gray-800 text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#274472] transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <button
                                type="button"
                                className="w-full bg-[#274472] text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-[#1a335d] transition-all"
                                onClick={() => alert("OTP Sent (Demo)")}
                            >
                                Send OTP
                            </button>
                        </>
                    )}
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 uppercase">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Toggle Login Method Button */}
                <button
                    type="button"
                    onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')}
                    className="w-full bg-gray-50 text-[#274472] font-bold py-3.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all text-sm mb-8"
                >
                    {loginMethod === 'password' ? 'Login with OTP' : 'Login with Password'}
                </button>

                {/* Footer Links */}
                <div className="text-center">
                    <a href="#" className="text-xs font-semibold text-[#274472] hover:underline mb-2 block">Forgot Password?</a>


                    <div className="mt-8 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-gray-300">Version 1.0.2</span>
                        <div className="flex gap-4 text-[10px] text-[#274472]">
                            <a href="#" className="hover:underline">Privacy Policy</a>
                            <span className="text-gray-300">•</span>
                            <a href="#" className="hover:underline">Terms of Service</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminLoginPage;
