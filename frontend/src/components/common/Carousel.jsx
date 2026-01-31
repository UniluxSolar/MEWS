import React from 'react';
import { BASE_URL } from '../../api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Custom Arrows
const NextArrow = ({ onClick }) => (
    <div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
        onClick={onClick}
    >
        <FaChevronRight />
    </div>
);

const PrevArrow = ({ onClick }) => (
    <div
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
        onClick={onClick}
    >
        <FaChevronLeft />
    </div>
);

const Carousel = ({ images, autoPlay = true, height = "h-64 md:h-96" }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: autoPlay,
        autoplaySpeed: 3000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        pauseOnHover: true,
        adaptiveHeight: false,
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className={`w-full ${height} relative overflow-hidden rounded-xl shadow-lg group`}>
            {/* Slick Slider */}
            <Slider {...settings} className="h-full">
                {images.map((img, index) => (
                    <div key={index} className="relative w-full h-full outline-none">
                        <div className={`w-full ${height} relative`}>
                            <img
                                src={img.imageUrl.startsWith('http') ? img.imageUrl : `${BASE_URL}/${img.imageUrl.replace(/\\/g, '/')}`}
                                alt={img.title || `Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Caption (Optional) */}
                            {(img.title || img.description) && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white pt-16">
                                    {img.title && <h3 className="text-xl font-bold mb-1">{img.title}</h3>}
                                    {img.description && <p className="text-sm opacity-90">{img.description}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Carousel;
