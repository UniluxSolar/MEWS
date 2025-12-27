import React, { useState } from 'react';
import {
    FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTh, FaList, FaCalendar,
    FaFilter, FaChevronDown, FaQrcode, FaMapMarkedAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';

// --- Components ---

const EventCard = ({
    id, image, title, organizer, type, date, location, participants,
    totalSeats, availableSeats, tags, onRegister
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition">
            <div className="h-40 bg-gray-200 relative">
                <img src={image} alt={title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full shadow-sm">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 font-medium">{organizer}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">
                        {type}
                    </span>
                </div>

                <div className="space-y-2 mt-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaCalendarAlt className="text-gray-400" /> {date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaMapMarkerAlt className="text-gray-400" /> {location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaUsers className="text-gray-400" /> {participants} people participating
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-600">Seats Available</span>
                        <span className={availableSeats < 20 ? "text-red-500" : "text-green-600"}>
                            {availableSeats} remaining
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                        <div
                            className={`h-1.5 rounded-full ${availableSeats < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${100 - (availableSeats / totalSeats) * 100}%` }}
                        ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            onClick={onRegister}
                            className="py-2 bg-[#1e2a4a] text-white text-xs font-bold rounded-lg hover:bg-[#2a3b66] transition"
                        >
                            Register Now
                        </button>
                        <Link to={`/dashboard/jobs/${id || '1'}`} className="py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition text-center flex items-center justify-center">
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyEventCard = ({ image, title, organizer, type, date, location, isPast }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition ${isPast ? 'opacity-75 grayscale' : ''}`}>
        <div className="h-48 bg-gray-200 relative">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 text-white text-xs font-bold rounded-full shadow-sm ${isPast ? 'bg-gray-500' : 'bg-green-500'}`}>
                    {isPast ? 'Completed' : 'Registered'}
                </span>
            </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{organizer}</p>
                </div>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-100">
                    {type}
                </span>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCalendarAlt className="text-gray-400" /> {date}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400" /> {location}
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <button className="w-full py-3 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2 shadow-sm" disabled={isPast}>
                    <FaQrcode /> {isPast ? 'Certificate Available' : 'View QR Code'}
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                        <FaCalendar /> {isPast ? 'View Summary' : 'Add to Calendar'}
                    </button>
                    {!isPast && (
                        <button className="py-2.5 border border-gray-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <FaMapMarkedAlt /> Directions
                        </button>
                    )}
                </div>
                {!isPast && (
                    <button className="w-full py-2 text-red-500 text-xs font-bold hover:text-red-700 transition flex items-center justify-center gap-1">
                        Cancel Registration
                    </button>
                )}
            </div>
        </div>
    </div>
);

// --- Views ---

const UpcomingEventsView = ({ onRegister }) => (
    <div className="space-y-6">
        {/* Filters */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search events by title, company, or location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
                {['Date: This Week', 'District: All', 'Event Type: All', 'Industry: All'].map((filter) => (
                    <div key={filter} className="relative">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 font-medium">
                            {filter} <FaChevronDown size={10} className="text-gray-400" />
                        </button>
                    </div>
                ))}
                <button className="text-sm text-primary font-bold hover:underline ml-auto">
                    Clear Filters
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button className="px-3 py-1.5 bg-[#1e2a4a] text-white rounded text-xs font-bold flex items-center gap-2 shadow-sm">
                        <FaTh /> Grid View
                    </button>
                    <button className="px-3 py-1.5 text-gray-600 rounded text-xs font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                        <FaCalendar /> Calendar View
                    </button>
                    <button className="px-3 py-1.5 text-gray-600 rounded text-xs font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                        <FaList /> List View
                    </button>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <EventCard
                id="1"
                onRegister={onRegister}
                image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                title="Tech Recruitment Drive 2025"
                organizer="MEWS x TechCorp"
                type="Job Mela"
                date="25 Nov 2025, 10:00 AM - 4:00 PM"
                location="JNTU Campus, Warangal"
                participants="12"
                totalSeats={150}
                availableSeats={45}
                tags={['Featured']}
            />
            <EventCard
                id="2"
                onRegister={onRegister}
                image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                title="Healthcare Jobs Fair"
                organizer="MEWS x Health Department, Telangana"
                type="Recruitment Drive"
                date="30 Nov 2025, 9:00 AM - 3:00 PM"
                location="Government Hospital Auditorium, Hyderabad"
                participants="8"
                totalSeats={200}
                availableSeats={120}
                tags={[]}
            />
            <EventCard
                id="3"
                onRegister={onRegister}
                image="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                title="Skill Development Workshop - Digital Marketing"
                organizer="MEWS Training Center"
                type="Workshop"
                date="05 Dec 2025, 2:00 PM - 5:00 PM"
                location="MEWS Community Center, Nizamabad"
                participants="6"
                totalSeats={50}
                availableSeats={38}
                tags={['New']}
            />
            <EventCard
                id="4"
                onRegister={onRegister}
                image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                title="Manufacturing Jobs - Walk-in Interviews"
                organizer="MEWS x Industrial Association"
                type="Recruitment Drive"
                date="10 Dec 2025, 10:00 AM - 2:00 PM"
                location="Industrial Training Institute, Karimnagar"
                participants="6"
                totalSeats={100}
                availableSeats={85}
                tags={[]}
            />
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500 mr-2">Showing 1-4 of 25 events</span>
            <button className="w-8 h-8 flex items-center justify-center bg-[#1e2a4a] text-white rounded font-bold text-xs">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-600 rounded font-bold text-xs hover:bg-gray-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-600 rounded font-bold text-xs hover:bg-gray-50">3</button>
            <button className="px-3 h-8 flex items-center justify-center border border-gray-300 text-gray-600 rounded font-bold text-xs hover:bg-gray-50">Next &gt;</button>
        </div>
    </div>
);

const MyEventsView = ({ onBrowseAll }) => {
    const [subTab, setSubTab] = useState('upcoming'); // upcoming, past

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <button
                    onClick={() => setSubTab('upcoming')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition ${subTab === 'upcoming' ? 'bg-[#1e2a4a] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    Upcoming Events
                </button>
                <button
                    onClick={() => setSubTab('past')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition ${subTab === 'past' ? 'bg-[#1e2a4a] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    Past Events
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subTab === 'upcoming' ? (
                    <>
                        <MyEventCard
                            image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            title="Tech Recruitment Drive 2025"
                            organizer="MEWS x TechCorp"
                            type="Job Mela"
                            date="25 Nov 2025, 10:00 AM - 4:00 PM"
                            location="JNTU Campus, Warangal"
                        />
                        <MyEventCard
                            image="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            title="Skill Development Workshop"
                            organizer="MEWS Training Center"
                            type="Workshop"
                            date="05 Dec 2025, 2:00 PM - 5:00 PM"
                            location="MEWS Community Center"
                        />
                    </>
                ) : (
                    <>
                        <MyEventCard
                            image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            title="Healthcare Jobs Fair"
                            organizer="MEWS x Health Department"
                            type="Training"
                            date="12 Oct 2025, 9:00 AM - 3:00 PM"
                            location="Government Hospital, Hyderabad"
                            isPast={true}
                        />
                        <MyEventCard
                            image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            title="Annual Career Guidance Seminar"
                            organizer="MEWS Central"
                            type="Seminar"
                            date="15 Sep 2025, 10:00 AM"
                            location="Town Hall, Karimnagar"
                            isPast={true}
                        />
                    </>
                )}
            </div>

            {subTab === 'upcoming' && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-4">Looking for more events?</p>
                    <button onClick={onBrowseAll} className="text-primary font-bold hover:underline">Browse All Upcoming Jobs & Events</button>
                </div>
            )}
        </div>
    );
};

const JobsEvents = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="w-full space-y-6 pb-12 relative">

            {/* Modal */}
            {showModal && (
                <RegistrationSuccessModal
                    onClose={() => setShowModal(false)}
                    eventTitle="Tech Recruitment Drive 2025"
                    date="25 Nov 2025, 10:00 AM - 4:00 PM"
                    location="JNTU Campus, Warangal"
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2a4a]">
                        {activeTab === 'upcoming' ? 'Jobs & Events' : 'My Events'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {activeTab === 'upcoming'
                            ? 'Discover employment opportunities and community events near you'
                            : 'View your registered events and manage your event participation'}
                    </p>
                </div>
                {activeTab === 'my_events' && (
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        Browse All Events
                    </button>
                )}
            </div>

            {/* Main Tabs */}
            {activeTab === 'upcoming' && (
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded text-xs font-semibold mb-2">
                    <span className="font-bold">25 upcoming events</span> | 350 members registered this month
                </div>
            )}

            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-3 text-sm font-bold transition-colors border-b-2
                    ${activeTab === 'upcoming' ? 'text-[#1e2a4a] border-[#1e2a4a]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                >
                    Upcoming Events
                </button>
                <button
                    onClick={() => setActiveTab('my_events')}
                    className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 flex items-center gap-2
                    ${activeTab === 'my_events' ? 'text-[#1e2a4a] border-[#1e2a4a]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                >
                    My Events <span className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-[10px]">3</span>
                </button>
            </div>

            {/* View Content */}
            {activeTab === 'upcoming' ? (
                <UpcomingEventsView onRegister={() => setShowModal(true)} />
            ) : (
                <MyEventsView onBrowseAll={() => setActiveTab('upcoming')} />
            )}

        </div>
    );
};

export default JobsEvents;
