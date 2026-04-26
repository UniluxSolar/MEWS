import React from 'react';
import { FaGooglePlay, FaApple, FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaHandHoldingHeart, FaCheckCircle, FaLock, FaUserShield, FaUserCircle, FaPlus, FaTrash } from 'react-icons/fa';

// Using a different placeholder background for variety or reuse existing if suitable.
// Ideally usage of specific 'hero-connect' image if available.

import { useState, useEffect } from 'react';
import ConnectHeroBg from '../assets/community-hero.jpg';
import Member1 from '../assets/member1.png';
import Member2 from '../assets/member2.png';
import Member3 from '../assets/member3.png';
import Member4 from '../assets/member4.png';
import LandingScroll1 from '../assets/landing_scroll_1.png';
import LandingScroll2 from '../assets/landing_scroll_2.png';
import MewsLogo from '../assets/mews_main_logo_new.png';
import AmbedkarImage from '../assets/ambedkar.png';
import HeroQuote1 from '../assets/hero_quote_1.png';
import HeroQuote2 from '../assets/hero_quote_2.png';
import HeroQuote3 from '../assets/hero_quote_3.jpg';
import HeroQuote4 from '../assets/hero_quote_4.png';
import HeroQuote5 from '../assets/hero_quote_5.jpg';
import API, { BASE_URL } from '../api';

const ConnectHero = () => {
    const quoteSlides = [
        { image: HeroQuote1, quote: "Jai Bhim! Educate, Agitate, Organize." },
        { image: HeroQuote2, quote: "Freedom of mind is the real freedom." },
        { image: HeroQuote3, quote: "Cultivation of mind should be the ultimate aim of human existence." },
        { image: HeroQuote4, quote: "We are Indians, firstly and lastly." },
        { image: HeroQuote5, quote: "Life should be great rather than long." },
    ];

    const [bgImages, setBgImages] = useState([ConnectHeroBg, LandingScroll1, Member1, LandingScroll2, Member2, Member3, Member4]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [heroMembers, setHeroMembers] = useState({});
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await API.get('/carousel/public?type=hero_background');
                if (data && data.length > 0) {
                    const dynamicImages = data.map(img =>
                        img.imageUrl.startsWith('http') ? img.imageUrl : `${BASE_URL}/${img.imageUrl.replace(/\\/g, '/')}`
                    );
                    setBgImages(dynamicImages);
                }
            } catch (error) {
                console.error("Failed to fetch hero banners", error);
            }
        };

        const fetchMembers = async () => {
            try {
                const { data } = await API.get('/carousel/public?type=hero_member');
                const memberMap = {};
                data.forEach(m => {
                    memberMap[m.order] = m;
                });
                setHeroMembers(memberMap);
            } catch (err) {
                console.error("Failed to fetch hero members", err);
            }
        };

        const checkAuth = () => {
            try {
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    const role = user?.role;
                    const isSuper = (role === 'SUPER_ADMIN' || ((user?.username === '8500626600' || user?.mobile === '8500626600' || user?.email === 'uniluxsolar@gmail.com')));
                    setIsSuperAdmin(!!isSuper);
                }
            } catch (e) {
                console.error("Auth check failed", e);
                setIsSuperAdmin(false);
            }
        };

        fetchBanners();
        fetchMembers();
        checkAuth();
    }, []);

    const handleUpload = async (slot, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'hero_member');
        formData.append('order', slot);
        formData.append('isActive', true);
        formData.append('title', heroMembers[slot]?.title || 'Name');
        formData.append('description', heroMembers[slot]?.description || 'Designation');

        try {
            if (heroMembers[slot]?._id) {
                await API.delete(`/carousel/${heroMembers[slot]._id}`);
            }
            const { data } = await API.post('/carousel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setHeroMembers(prev => ({ ...prev, [slot]: data }));
            alert("Member photo updated!");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Super Admin access required.");
        }
    };

    const updateMemberText = (slot, field, value) => {
        setHeroMembers(prev => ({
            ...prev,
            [slot]: { ...prev[slot], [field]: value }
        }));
    };

    const saveMemberText = async (slot) => {
        const member = heroMembers[slot];
        if (!member || !member._id) return;
        try {
            await API.put(`/carousel/${member._id}`, {
                title: member.title,
                description: member.description
            });
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const deleteMember = async (slot) => {
        const member = heroMembers[slot];
        if (!member || !member._id) return;
        if (!window.confirm("Delete this member photo?")) return;
        try {
            await API.delete(`/carousel/${member._id}`);
            setHeroMembers(prev => {
                const newMap = { ...prev };
                delete newMap[slot];
                return newMap;
            });
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (bgImages.length > 1) {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
            }
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quoteSlides.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [bgImages.length, quoteSlides.length]);

    return (
        <div className="relative bg-[#1e2a4a] overflow-hidden min-h-[600px] flex items-center">
            {/* Fading Background Slideshow */}
            <div className="absolute inset-0 z-0">
                {bgImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img src={img} alt="Bg" className="w-full h-full object-cover" />
                    </div>
                ))}

                <div className="absolute inset-0 bg-[#1e2a4a]/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e2a4a] via-[#1e2a4a]/70 to-transparent"></div>
            </div>

            {/* Custom CSS for Animations */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>

            {/* Sidebar Logo & Members Section */}
            <div className="hidden lg:flex flex-col items-center absolute left-4 top-4 z-20 w-[190px] gap-8">
                {/* Rotating Logo */}
                <div className="relative w-[180px] h-[180px] flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl filter opacity-40 animate-pulse"></div>
                    <img
                        src={MewsLogo}
                        alt="MEWS Logo"
                        className="absolute inset-0 w-[160px] h-[160px] object-cover m-auto z-10 drop-shadow-2xl animate-spin-slow rounded-full"
                    />
                </div>

                {/* Hero Members Section - 6 circles arranged 3x2 */}
                <div className="grid grid-cols-3 gap-y-8 gap-x-2 w-full px-1">
                    {[0, 1, 2, 3, 4, 5].map((slot) => (
                        <div key={slot} className="flex flex-col items-center group relative">
                            {/* Member Circle */}
                            <div 
                                onClick={() => isSuperAdmin && document.getElementById(`member-upload-${slot}`).click()}
                                className={`relative w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 backdrop-blur-sm transition-all duration-300 shadow-lg ${isSuperAdmin ? 'cursor-pointer hover:border-blue-400 hover:scale-110 active:scale-95' : ''}`}
                            >
                                {heroMembers[slot]?.imageUrl ? (
                                    <img 
                                        src={heroMembers[slot].imageUrl.startsWith('http') ? heroMembers[slot].imageUrl : `${BASE_URL}/${heroMembers[slot].imageUrl.replace(/\\/g, '/')}`} 
                                        alt={heroMembers[slot].title || 'Member'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <FaUserCircle size={40} />
                                    </div>
                                )}
                                
                                {isSuperAdmin && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                        <FaPlus className="text-white text-xs mb-1" />
                                        <span className="text-[8px] text-white font-bold uppercase">Upload</span>
                                    </div>
                                )}
                                
                                {isSuperAdmin && (
                                    <input 
                                        type="file" 
                                        id={`member-upload-${slot}`} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleUpload(slot, e.target.files[0])}
                                    />
                                )}
                            </div>

                            {/* Delete Button (Super Admin Only) */}
                            {isSuperAdmin && heroMembers[slot]?._id && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteMember(slot); }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30 hover:bg-red-600"
                                >
                                    <FaTrash size={8} />
                                </button>
                            )}
                            
                            {/* Name & Designation */}
                            <div className="mt-2 text-center w-full px-1">
                                {isSuperAdmin ? (
                                    <div className="flex flex-col gap-0.5">
                                        <input 
                                            value={heroMembers[slot]?.title || ''}
                                            placeholder="Name"
                                            onChange={(e) => updateMemberText(slot, 'title', e.target.value)}
                                            onBlur={() => saveMemberText(slot)}
                                            className="bg-transparent text-[10px] text-white font-bold w-full text-center focus:outline-none border-b border-transparent focus:border-blue-400 placeholder:text-white/20"
                                        />
                                        <input 
                                            value={heroMembers[slot]?.description || ''}
                                            placeholder="Designation"
                                            onChange={(e) => updateMemberText(slot, 'description', e.target.value)}
                                            onBlur={() => saveMemberText(slot)}
                                            className="bg-transparent text-[9px] text-blue-300 w-full text-center focus:outline-none border-b border-transparent focus:border-blue-400 placeholder:text-white/20"
                                        />
                                    </div>
                                ) : (
                                    <div className="max-w-full">
                                        <p className="text-[10px] text-white font-bold leading-tight line-clamp-1">{heroMembers[slot]?.title || ''}</p>
                                        <p className="text-[9px] text-blue-300 leading-tight line-clamp-1">{heroMembers[slot]?.description || ''}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16">
                {/* Content spacer to avoid overlap with absolute logo */}
                <div className="hidden lg:block w-[210px] shrink-0"></div>

                <div className="max-w-3xl lg:mt-8 flex-1">
                    <div className="flex gap-4 mb-6 text-xs font-semibold uppercase tracking-wider text-green-400">
                        <span className="flex items-center gap-1"><FaCheckCircle /> Community Verified</span>
                        <span className="flex items-center gap-1"><FaLock /> Secure</span>
                        <span className="flex items-center gap-1"><FaUserShield /> Free to Use</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        MEWS
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-300 font-light mb-2">
                        Empowering the Mala Community
                    </p>
                    <p className="text-2xl sm:text-3xl text-white font-bold mb-8">
                        One Platform. Five Lifelines.
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-10">
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaGraduationCap /> Education</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaHeartbeat /> Health</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaBalanceScale /> Legal Aid</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaBriefcase /> Jobs</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaHandHoldingHeart /> Welfare</span>
                    </div>

                    {/* Downloads */}
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-[#1e2a4a] px-5 py-2.5 rounded-md font-bold flex items-center gap-3 hover:bg-gray-100 transition shadow-lg">
                            <FaGooglePlay size={20} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase">Get it on</div>
                                <div className="text-sm">Google Play</div>
                            </div>
                        </button>
                        <button className="bg-white text-[#1e2a4a] px-5 py-2.5 rounded-md font-bold flex items-center gap-3 hover:bg-gray-100 transition shadow-lg">
                            <FaApple size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase">Download on the</div>
                                <div className="text-sm">App Store</div>
                            </div>
                        </button>

                    </div>
                </div>

                {/* Ambedkar Image Section with Quotes - Positioned on the right */}
                <div className="hidden lg:flex justify-center items-center relative w-[450px] h-[550px] lg:mt-10 shrink-0">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[100px] filter opacity-40 animate-pulse"></div>
                    
                    {quoteSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center ${
                                index === currentQuoteIndex ? 'opacity-100 translate-x-0 rotate-0 scale-100' : 'opacity-0 translate-x-12 rotate-6 scale-90 pointer-events-none'
                            }`}
                        >
                            <div className="relative w-full h-full flex flex-col items-center">
                                {/* Image Container */}
                                <div className="relative z-10 w-[320px] h-[320px] mb-8">
                                     <div className="absolute inset-0 bg-gradient-to-t from-[#1e2a4a]/40 to-transparent rounded-full opacity-30 z-20"></div>
                                     <img
                                        src={slide.image}
                                        alt={`Ambedkar Quote ${index + 1}`}
                                        className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)] filter brightness-105 contrast-105"
                                    />
                                </div>
                                
                                {/* Quote Box Overlay */}
                                <div className="relative z-30 w-full px-4">
                                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transform transition-all duration-700 hover:bg-white/10">
                                        <div className="absolute -top-3 -left-2 text-blue-400 opacity-40">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017C11.4647 12 11.017 11.5523 11.017 11V9C11.017 6.79086 12.8079 5 15.017 5H19.017C21.2261 5 23.017 6.79086 23.017 9V15C23.017 18.866 19.883 22 16.017 22H14.017V21ZM2.01697 21L2.01697 18C2.01697 16.8954 2.91241 16 4.01697 16H7.01697C7.56925 16 8.01697 15.5523 8.01697 15V9C8.01697 8.44772 7.56925 8 7.01697 8H3.01697C2.46468 8 2.01697 8.44772 2.01697 9V11C2.01697 11.5523 1.56925 12 1.01697 12H0.0169678C-0.535317 12 -0.983032 11.5523 -0.983032 11V9C-0.983032 6.79086 0.807827 5 3.01697 5H7.01697C9.22611 5 11.017 6.79086 11.017 9V15C11.017 18.866 7.88297 22 4.01697 22H2.01697V21Z"/></svg>
                                        </div>
                                        <p className="text-white text-xl font-semibold italic tracking-wide leading-snug text-center drop-shadow-lg">
                                            {slide.quote}
                                        </p>
                                        <div className="mt-4 flex justify-center gap-1.5">
                                            {quoteSlides.map((_, i) => (
                                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'bg-blue-500 w-6' : 'bg-white/20 w-1.5'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div >
    );
};

export default ConnectHero;
