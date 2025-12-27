import React from 'react';
import AnushaImg from '../assets/anusha.png';
import SrinivasImg from '../assets/srinivas.png';
import PadmaImg from '../assets/padma.png';
import VenkatImg from '../assets/venkat.png';

const StoryCard = ({ image, name, location, quote, tags }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4 mb-6">
            <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
            <div>
                <h4 className="font-bold text-primary text-lg">{name}</h4>
                <p className="text-sm text-gray-500 font-medium">{location}</p>
            </div>
        </div>
        <p className="text-gray-600 text-sm italic mb-6 leading-relaxed flex-grow">
            "{quote}"
        </p>
        <div className="pt-4 border-t border-gray-50 text-xs font-bold text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {tags}
        </div>
    </div>
);

const Testimonials = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-3 tracking-tight">Real Stories, Real Impact</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">Hear from our community members across Telangana whose lives have been transformed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <StoryCard
                        image={AnushaImg}
                        name="Anusha Reddy"
                        location="Hyderabad, Telangana"
                        quote="The MEWS scholarship helped me complete my B.Tech. Today I work at a top MNC in Hitech City and can support my parents."
                        tags="Education Support • ₹2.5 Lakhs"
                    />
                    <StoryCard
                        image={SrinivasImg}
                        name="Srinivas Rao"
                        location="Karimnagar, Telangana"
                        quote="When I needed urgent heart surgery, MEWS health assistance covered the cost. I am healthy now and back to farming."
                        tags="Health Assistance • ₹3.2 Lakhs"
                    />
                    <StoryCard
                        image={PadmaImg}
                        name="Padma"
                        location="Warangal, Telangana"
                        quote="My small tailoring business started with a loan facilitated by MEWS skills training. Now I employ two other women from my village."
                        tags="Livelihood Support • Sewing Machine"
                    />
                    <StoryCard
                        image={VenkatImg}
                        name="Venkatesh"
                        location="Nizamabad, Telangana"
                        quote="MEWS legal aid helped us resolve a long-standing land dispute. The lawyers were very supportive and guided us properly."
                        tags="Legal Aid • Property Dispute"
                    />
                </div>

                <div className="text-center">
                    <button className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-sm hover:bg-gray-50 transition transform hover:-translate-y-0.5">
                        View All Stories
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
