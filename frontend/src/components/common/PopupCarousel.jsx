import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import slide1 from '../../assets/popup_new_1.jpg';
import slide2 from '../../assets/popup_new_2.jpg';

const PopupCarousel = ({ isOpen, onClose, storageKey }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const images = [slide1, slide2];
    const autoScrollTimer = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Check storage if key is provided
            if (storageKey) {
                const hasSeen = sessionStorage.getItem(storageKey);
                if (hasSeen) {
                    onClose();
                    return;
                }
            }
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, storageKey, onClose]);

    useEffect(() => {
        if (isVisible) {
            startTimer();
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [isVisible, currentIndex]);

    const startTimer = () => {
        stopTimer();
        autoScrollTimer.current = setInterval(() => {
            nextSlide();
        }, 3000); // 3 seconds
    };

    const stopTimer = () => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleClose = () => {
        setIsVisible(false);
        if (storageKey) {
            sessionStorage.setItem(storageKey, 'true');
        }
        // Small timeout to allow animation to finish before unmounting/hiding
        setTimeout(onClose, 300);
    };

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/80 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}
        >
            <div
                className={`relative bg-transparent max-w-4xl w-full mx-auto transform transition-all duration-500 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
                onMouseEnter={stopTimer}
                onMouseLeave={startTimer}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-10 right-0 md:-right-10 w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md border border-white/20 z-50 group"
                    aria-label="Close Popup"
                >
                    <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Main Content Container */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">

                    {/* Images */}
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <img
                                src={img}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-contain md:object-cover" // Contain on mobile to prevent cropping important text, cover on desktop
                            />
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 border border-white/10 opacity-0 group-hover:opacity-100 md:opacity-100"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 border border-white/10 opacity-0 group-hover:opacity-100 md:opacity-100"
                    >
                        <FaChevronRight />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default PopupCarousel;
