import React, { useState, useRef } from 'react';
import {
    FaPlus, FaSearch, FaFilter, FaCircle, FaCommentAlt,
    FaPaperclip, FaChevronRight, FaTicketAlt, FaTimes, FaFileAlt, FaTrash, FaArrowLeft
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TicketRow = ({ id, subject, category, date, status, hasAttachment, onClick }) => {
    const statusColors = {
        'Open': 'bg-green-100 text-green-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Closed': 'bg-gray-100 text-gray-600'
    };

    return (
        <div onClick={onClick} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition bg-white mb-3 group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${status === 'Open' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                    <FaTicketAlt />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-0.5 group-hover:text-primary transition">
                        {subject}
                        {hasAttachment && <FaPaperclip className="inline ml-2 text-gray-400 text-xs" />}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-mono">{id}</span>
                        <span>•</span>
                        <span>{category}</span>
                        <span>•</span>
                        <span>{date}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status] || 'bg-gray-100'}`}>
                    {status}
                </span>
                <FaChevronRight className="text-gray-300 group-hover:text-secondary" />
            </div>
        </div>
    );
};

const TicketDetailModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    const statusColors = {
        'Open': 'bg-green-100 text-green-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Closed': 'bg-gray-100 text-gray-600'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#1e2a4a] p-5 flex justify-between items-start text-white flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-xs opacity-70 bg-white/10 px-2 py-0.5 rounded">{ticket.id}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white`}>
                                {ticket.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-xl leading-tight">{ticket.subject}</h3>
                    </div>
                    <button onClick={onClose} className="hover:text-red-300 transition bg-white/10 p-2 rounded-full"><FaTimes size={16} /></button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-6 text-sm p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</span>
                            <span className="font-semibold text-gray-800">{ticket.category}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Created</span>
                            <span className="font-semibold text-gray-800">{ticket.date}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</span>
                            <span className="font-semibold text-gray-800 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${ticket.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                {ticket.priority || 'Medium'}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FaFileAlt className="text-gray-400" /> Description
                        </h4>
                        <div className="text-gray-600 leading-relaxed bg-white border border-gray-100 p-4 rounded-lg shadow-sm text-sm">
                            <p>Here is the detailed description of the issue regarding {ticket.subject}. It seems there is a need for clarification or action.</p>
                            <p className="mt-2 text-xs text-gray-400 text-right">Attached: {ticket.hasAttachment ? 'Screenshot.png' : 'None'}</p>
                        </div>
                    </div>

                    {/* Conversation History (Mock) */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCommentAlt className="text-gray-400" /> Activity Log
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">You</div>
                                <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700 flex-1 border border-blue-100">
                                    <p>Ticket created. Awaiting support response.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{ticket.date} • 10:30 AM</p>
                                </div>
                            </div>
                            {ticket.status === 'Closed' && (
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">SP</div>
                                    <div className="bg-green-50 p-3 rounded-lg rounded-tr-none text-sm text-gray-700 flex-1 border border-green-100 text-right">
                                        <p>This issue has been resolved. Closing the ticket. Feel free to reopen if needed.</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Jan 12, 2025 • 02:15 PM</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer input */}
                {ticket.status !== 'Closed' && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                        <div className="flex gap-2">
                            <input type="text" placeholder="Type a reply..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                            <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#151f38] transition">Reply</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CreateTicketModal = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;

    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General Inquiry',
        description: '',
        priority: 'Medium',
        attachment: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
        setFormData({ subject: '', category: 'General Inquiry', description: '', priority: 'Medium', attachment: null });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, attachment: e.target.files[0] });
        }
    };

    const removeFile = () => {
        setFormData({ ...formData, attachment: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-[#1e2a4a] p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">Create New Ticket</h3>
                    <button onClick={onClose} className="hover:text-red-300 transition"><FaTimes size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Briefly describe your issue"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>General Inquiry</option>
                                <option>Scholarship</option>
                                <option>Technical Issue</option>
                                <option>Profile Update</option>
                                <option>Payment/Donation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            placeholder="Provide detailed information..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Attachments</label>

                        {!formData.attachment ? (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                            >
                                <FaPaperclip className="mx-auto text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500 block">Attach Screenshot or Document (Max 5MB)</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <FaFileAlt size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{formData.attachment.name}</p>
                                        <p className="text-xs text-gray-500">{(formData.attachment.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 text-gray-400 hover:text-red-500 transition"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-secondary text-white font-bold text-sm rounded-lg hover:bg-amber-600 transition shadow-md"
                        >
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Helpdesk = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Renamed for clarity
    const [selectedTicket, setSelectedTicket] = useState(null); // New state for details modal

    const [tickets, setTickets] = useState([
        { id: 'TKT-2025-8921', subject: 'Scholarship Application Status Inquiry', category: 'Scholarship', date: 'Jan 10, 2025', status: 'Open', hasAttachment: false, priority: 'High' },
        { id: 'TKT-2024-7655', subject: 'Bank Account Update Request', category: 'Profile Update', date: 'Dec 15, 2024', status: 'Closed', hasAttachment: true, priority: 'Medium' },
        { id: 'TKT-2024-7100', subject: 'Login Issues on Mobile', category: 'Technical Issue', date: 'Nov 22, 2024', status: 'Closed', hasAttachment: false, priority: 'High' },
    ]);

    const handleCreateTicket = (newTicketData) => {
        const newTicket = {
            id: `TKT-2025-${Math.floor(1000 + Math.random() * 9000)}`,
            subject: newTicketData.subject,
            category: newTicketData.category,
            status: 'Open',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            hasAttachment: !!newTicketData.attachment,
            priority: newTicketData.priority
        };
        setTickets([newTicket, ...tickets]);
        setIsCreateModalOpen(false);
    };

    const filteredTickets = activeFilter === 'All'
        ? tickets
        : tickets.filter(t => t.status === activeFilter);

    // Calculate dynamic stats
    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        closed: tickets.filter(t => t.status === 'Closed').length
    };

    return (
        <div className="w-full space-y-6 pb-12 relative">

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateTicket}
            />

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}

            {/* Back Button */}
            <div className="">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2a4a]">Need Help?</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and manage your support requests</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-secondary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amber-600 transition shadow-lg flex items-center gap-2"
                >
                    <FaPlus size={12} /> Create New Ticket
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Tickets</p>
                    <p className="text-3xl font-bold text-[#1e2a4a] mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                    <p className="text-xs font-bold text-gray-500 uppercase">Open</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.open}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-xs font-bold text-gray-500 uppercase">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Closed</p>
                    <p className="text-3xl font-bold text-gray-400 mt-1">{stats.closed}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['All', 'Open', 'In Progress', 'Closed'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${activeFilter === filter
                            ? 'bg-[#1e2a4a] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Ticket List */}
            <div>
                {filteredTickets.map(ticket => (
                    <TicketRow
                        key={ticket.id}
                        {...ticket}
                        onClick={() => setSelectedTicket(ticket)}
                    />
                ))}
            </div>

            {/* Empty State Illustration */}
            {filteredTickets.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                        <FaTicketAlt size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800">No tickets found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeFilter === 'All' ? "You haven't raised any support tickets yet." : `No tickets with status '${activeFilter}'.`}
                    </p>
                </div>
            )}

        </div>
    );
};

export default Helpdesk;
