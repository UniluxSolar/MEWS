import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaArrowRight, FaUserShield } from 'react-icons/fa';

// Background Image (Ensure this absolute path is correct/accessible or move to assets in real app)
// For this environment, we use the generated artifact path directly or a relative accessible path if moved.
// I will use the path relative to the public folder if I could, but here I will use the artifact link logic or a placeholder if I can't move it.
// Actually, I should probably use the absolute path for now or Base64 if I can't serving it.
// The user has the image at C:/Users/PC/.gemini/antigravity/brain/6c9d8d32-6595-4bd7-82af-f248966b3da1/telugu_community_background_1765531925679.png
// I cannot easily access that from the browser unless I move it to the public folder.
// I will attempt to move it or just use an inline style with the absolute path (which might fail in browser due to security).
// Better approach: I will assume the user has a way to serve it or I will use a placeholder URL for "telugu community" if I cannot move it.
// Wait, I can't move files easily to 'public' if it's not in the workspace.
// The workspace is "d:\VENKY\MEWS".
// I will try to use the file:// protocol or just describe it.
// Actually, I can use the tool `run_command` to copy the file to `d:\VENKY\MEWS\frontend\public\assets\images\` effectively.

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ adminId: '', password: '' });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock admin login
        navigate('/admin/dashboard', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden bg-[#1e2a4a]">

            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e85d04]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-[#e85d04] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition duration-300">
                        <FaShieldAlt size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        MEWS Admin
                    </h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Authorized Access Only
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="adminId" className="sr-only">Admin ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#e85d04] transition">
                                    <FaUserShield />
                                </div>
                                <input
                                    id="adminId"
                                    name="adminId"
                                    type="text"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-4 py-3.5 bg-white/10 border border-gray-500 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-[#e85d04] focus:border-transparent sm:text-sm transition-all shadow-inner"
                                    placeholder="Admin ID"
                                    value={credentials.adminId}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#e85d04] transition">
                                    <FaLock />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-4 py-3.5 bg-white/10 border border-gray-500 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-[#e85d04] focus:border-transparent sm:text-sm transition-all shadow-inner"
                                    placeholder="Password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#e85d04] focus:ring-[#e85d04] border-gray-500 rounded bg-white/10"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-[#e85d04] hover:text-orange-400">
                                Need help?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#e85d04] to-[#f59e0b] hover:from-[#d05304] hover:to-[#e08e0b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e2a4a] focus:ring-[#e85d04] transition-all shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <FaArrowRight className="h-4 w-4 text-orange-100 group-hover:text-white transition" />
                            </span>
                            Access Dashboard
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-white/10">
                    <Link to="/" className="text-xs text-gray-300 hover:text-white transition flex items-center justify-center gap-2">
                        ← Back to User Portal
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full text-gray-400 text-xs z-10">
                &copy; 2025 MEWS Admin System. Restricted Access.
            </div>
        </div>
    );
};

export default AdminLoginPage;
