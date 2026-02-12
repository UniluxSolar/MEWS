import React from 'react';
import mewsLogo from '../../assets/mews_main_logo_new.png';

const LoginLayout = ({ children, title, subtitle, footerLink, footerText, onFooterClick }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] to-[#d1d9e6] p-4 font-sans text-gray-800 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1e2a4a] rounded-full blur-3xl opacity-10 animate-pulse"></div>

            <div className="w-full max-w-[450px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-10 transition-all duration-500 relative z-10 hover:shadow-blue-900/10">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-[#1e2a4a] to-[#3a4b7a] rounded-3xl flex items-center justify-center shadow-xl mb-6 transform transition hover:scale-105 duration-300">
                        <img src={mewsLogo} alt="MEWS" className="w-16 h-16 object-contain" />
                    </div>
                    <h1 className="text-[#1e2a4a] text-3xl font-black tracking-tight mb-2">MEWS</h1>
                    {title && <p className="text-[#1e2a4a]/80 text-sm font-bold uppercase tracking-[0.2em]">{title}</p>}
                    {subtitle && <p className="text-gray-500 text-xs mt-2 font-medium">{subtitle}</p>}
                </div>

                <div className="space-y-6">
                    {children}
                </div>

                {(footerText || footerLink) && (
                    <div className="mt-10 text-center">
                        <p className="text-gray-400 text-sm font-medium">
                            {footerText}{' '}
                            <button
                                onClick={onFooterClick}
                                className="text-[#1e2a4a] font-bold hover:underline transition-all"
                            >
                                {footerLink}
                            </button>
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        &copy; 2026 MEWS Organization <br />
                        Empowering Communities Together
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                input::placeholder {
                    color: #a0aec0;
                    font-weight: 500;
                    letter-spacing: normal;
                }
            `}} />
        </div>
    );
};

export default LoginLayout;
