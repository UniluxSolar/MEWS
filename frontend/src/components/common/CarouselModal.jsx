import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Carousel from './Carousel';
import API from '../../api';

const CarouselModal = ({ onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAndFetch = async () => {
            // 1. Check Session Storage
            const hasSeen = sessionStorage.getItem('hasSeenLoginCarousel');
            if (hasSeen) {
                // If already seen, don't show
                onClose && onClose(); // Notify parent anyway
                return;
            }

            try {
                // 2. Fetch Public/Active Carousel Images
                const { data } = await API.get('/carousel/public');

                if (data && data.length > 0) {
                    setImages(data);
                    setIsOpen(true);
                } else {
                    // No images to show
                    onClose && onClose();
                }
            } catch (error) {
                console.error("Failed to fetch carousel images", error);
                onClose && onClose();
            } finally {
                setLoading(false);
            }
        };

        checkAndFetch();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenLoginCarousel', 'true');
        if (onClose) setTimeout(onClose, 300); // Allow animation to finish
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl bg-transparent animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-10 right-0 md:-right-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 z-50 transition-all hover:rotate-90"
                >
                    <FaTimes size={20} />
                </button>

                {/* Carousel */}
                <Carousel images={images} height="h-[300px] md:h-[500px]" />

            </div>
        </div>
    );
};

export default CarouselModal;
