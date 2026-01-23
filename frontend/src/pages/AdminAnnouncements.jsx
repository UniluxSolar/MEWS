import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/common/DashboardHeader';
import API from '../api';
import {
    FaBullhorn, FaHistory, FaPlus, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink,
    FaCloudUploadAlt, FaEye, FaSave, FaPaperPlane, FaClock, FaCheckCircle, FaExclamationTriangle,
    FaUsers, FaCalendarAlt, FaChevronDown, FaCheckSquare, FaSquare, FaChartBar, FaFileAlt, FaTimes
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom Multi-Select Component
const memberOccupations = [
    "Student", "Farmer", "Business", "Private Employee",
    "Government Employee", "Labourer", "House Wife", "Unemployed",
    "Retired Govt. Employee", "Retired Private Employee", "Homemaker", "Other"
];

const MultiSelect = ({ options, selectedValues, onChange, placeholder, labelKey = 'name', valueKey = '_id' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    // ... rest of MultiSelect (unchanged)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        const value = option[valueKey];
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(newSelection);
    };

    const getDisplayLabel = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === options.length) return `All Selected (${options.length})`;
        if (selectedValues.length === 1) {
            const selected = options.find(o => o[valueKey] === selectedValues[0]);
            return selected ? selected[labelKey] : placeholder;
        }
        return `${selectedValues.length} items selected`;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:border-blue-400 transition"
            >
                <span className={selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}>
                    {getDisplayLabel()}
                </span>
                <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={12} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                        options.map(option => {
                            const isSelected = selectedValues.includes(option[valueKey]);
                            return (
                                <div
                                    key={option[valueKey]}
                                    onClick={() => toggleOption(option)}
                                    className={`px-4 py-2 text-sm flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition ${isSelected ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className={`text-${isSelected ? 'blue-600' : 'gray-300'}`}>
                                        {isSelected ? <FaCheckSquare /> : <FaSquare />}
                                    </div>
                                    <span className={isSelected ? 'font-bold text-blue-900' : 'text-gray-700'}>
                                        {option[labelKey]}
                                        {option.surname && ` ${option.surname}`} {/* Handle Member Name */}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

const AdminAnnouncements = () => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [viewHistory, setViewHistory] = useState(false);

    // State for Role & Logic
    const [adminInfo, setAdminInfo] = useState(null);
    const [targetScope, setTargetScope] = useState(''); // 'whole', 'selected'
    const [targetType, setTargetType] = useState(''); // 'villages', 'mandals', 'districts', 'members'
    const [availableTargets, setAvailableTargets] = useState([]);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [loadingTargets, setLoadingTargets] = useState(false);

    // History State
    const [announcements, setAnnouncements] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [announcementSubject, setAnnouncementSubject] = useState('');
    const [announcementBody, setAnnouncementBody] = useState('');
    const [scheduleType, setScheduleType] = useState('now');
    const [scheduledDate, setScheduledDate] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (file.size > 5242880) {
                alert(`File ${file.name} exceeds 5 MB Limit.`);
                return false;
            }
            return true;
        });
        setAttachments(prev => [...prev, ...validFiles]);
        // Clear input so same file can be selected again if removed
        e.target.value = '';
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };


    // Editor Logic
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        listUl: false,
        listOl: false
    });

    const updateActiveFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            listUl: document.queryCommandState('insertUnorderedList'),
            listOl: document.queryCommandState('insertOrderedList')
        });
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        updateActiveFormats();
        if (editorRef.current) {
            setAnnouncementBody(editorRef.current.innerHTML);
        }
    };

    const handleEditorInput = (e) => {
        setAnnouncementBody(e.currentTarget.innerHTML);
        updateActiveFormats();
    };

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // Keep editor content in sync when state is cleared (e.g. on Cancel or Send)
    useEffect(() => {
        if (editorRef.current && announcementBody === '' && editorRef.current.innerHTML !== '') {
            editorRef.current.innerHTML = '';
        }
    }, [announcementBody]);

    useEffect(() => {
        const info = localStorage.getItem('adminInfo');
        if (info) {
            const parsed = JSON.parse(info);
            setAdminInfo(parsed);

            // Set Default Scope based on role
            if (parsed.role === 'VILLAGE_ADMIN') {
                setTargetType('members'); // Specific members
                setTargetScope('whole');
            } else if (parsed.role === 'MANDAL_ADMIN') {
                setTargetType('villages');
                setTargetScope('whole');
            } else if (parsed.role === 'DISTRICT_ADMIN') {
                setTargetType('mandals');
                setTargetScope('whole');
            } else if (parsed.role === 'STATE_ADMIN') {
                setTargetType('districts');
                setTargetScope('whole');
            }
        }
    }, []);

    // Fetch Targets when needed
    useEffect(() => {
        const fetchTargets = async () => {
            if (targetScope !== 'selected' || !adminInfo) return;

            setLoadingTargets(true);
            setCurrentlySelectedLabel(); // Reset label logic or handle elsewhere

            try {
                let endpoint = '';
                let params = {};

                if (targetType === 'members') {
                    // Village Admin fetching members
                    const { data } = await API.get('/members');
                    setAvailableTargets(data);
                } else if (targetType === 'occupation') {
                    // Static Occupation List mapped to expected format
                    setAvailableTargets(memberOccupations.map(occ => ({ _id: occ, name: occ })));
                } else {
                    // Fetching Locations
                    let type = '';
                    if (targetType === 'villages') type = 'VILLAGE';
                    if (targetType === 'mandals') type = 'MANDAL';
                    if (targetType === 'districts') type = 'DISTRICT';

                    // Determine parent. User's assigned location is the parent.
                    // Assumption: adminInfo.assignedLocation is the ID of their jurisdiction
                    const { data } = await API.get(`/locations?type=${type}&parent=${adminInfo.assignedLocation}`);
                    setAvailableTargets(data);
                }
            } catch (error) {
                console.error("Failed to fetch targets", error);
            } finally {
                setLoadingTargets(false);
            }
        };

        fetchTargets();
    }, [targetScope, targetType, adminInfo]);

    // Fetch History
    const fetchAnnouncements = async () => {
        setLoadingHistory(true);
        try {
            const { data } = await API.get('/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'announcements') {
            fetchAnnouncements();
        }
    }, [activeTab]);

    // Construct Display Strings
    const getTargetDescription = () => {
        if (!adminInfo) return '';
        const role = adminInfo.role;

        if (targetScope === 'whole') {
            if (role === 'VILLAGE_ADMIN') return `Entire Village (${adminInfo.assignedLocationName || 'All Members'})`;
            if (role === 'MANDAL_ADMIN') return `Entire Mandal (${adminInfo.assignedLocationName || 'All Villages'})`;
            if (role === 'DISTRICT_ADMIN') return `Entire District (${adminInfo.assignedLocationName || 'All Mandals'})`;
            if (role === 'STATE_ADMIN') return `Entire State (${adminInfo.assignedLocationName || 'All Districts'})`;
        } else {
            if (selectedTargets.length === 0) return 'No targets selected';
            return `Selected: ${selectedTargets.length} ${targetType}`;
        }
        return '';
    };

    const setCurrentlySelectedLabel = () => {
        // Trigger re-render mostly
    };

    const handleSend = async () => {
        if (!announcementSubject || !announcementBody || !targetScope) {
            alert('Please fill in all required fields');
            return;
        }

        if (scheduleType === 'later' && !scheduledDate) {
            alert('Please select a date and time for scheduling');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('subject', announcementSubject);
            formData.append('body', announcementBody);
            formData.append('targetScope', targetScope);
            formData.append('targetType', targetType);
            formData.append('selectedTargets', JSON.stringify(selectedTargets));
            formData.append('schedule', scheduleType);
            if (scheduleType === 'later') {
                formData.append('scheduledDate', scheduledDate);
            }

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await API.post('/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(scheduleType === 'later' ? 'Announcement Scheduled Successfully!' : 'Announcement Sent Successfully!');

            // Reset Form
            setAnnouncementSubject('');
            setAnnouncementBody('');
            setTargetScope(adminInfo.role === 'VILLAGE_ADMIN' ? 'whole' : '');
            setSelectedTargets([]);
            setAttachments([]);
            setScheduleType('now');
            setScheduledDate('');

            // Refresh History
            fetchAnnouncements();
            setViewHistory(true); // Switch to history view

        } catch (error) {
            console.error("Failed to process announcement", error);
            alert('Failed to process announcement');
        }
    };

    const handleSaveDraft = async () => {
        if (!announcementSubject || !announcementBody) {
            alert('Draft must at least have a subject and body.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('subject', announcementSubject);
            formData.append('body', announcementBody);
            formData.append('targetScope', targetScope || 'draft');
            formData.append('targetType', targetType || 'members');
            formData.append('selectedTargets', JSON.stringify(selectedTargets || []));
            formData.append('schedule', 'now');
            formData.append('status', 'draft');

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await API.post('/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Draft Saved Successfully!');
            // Reset Form
            setAnnouncementSubject('');
            setAnnouncementBody('');
            setTargetScope(adminInfo.role === 'VILLAGE_ADMIN' ? 'whole' : '');
            setSelectedTargets([]);
            setAttachments([]);
            fetchAnnouncements();
            setViewHistory(true);
        } catch (error) {
            console.error("Failed to save draft", error);
            alert('Failed to save draft');
        }
    };

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel? Any unsaved text will be lost.")) {
            setAnnouncementSubject('');
            setAnnouncementBody('');
            setTargetScope(adminInfo.role === 'VILLAGE_ADMIN' ? 'whole' : '');
            setSelectedTargets([]);
            setAttachments([]);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="announcements" />

                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Announcements & Reports"
                        subtitle="Manage announcements and system reports."
                        breadcrumb={
                            <>
                                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span className="opacity-70">&gt;</span>
                                <span>Announcements</span>
                            </>
                        }
                    >
                        <button className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white p-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition">
                            <FaHistory /> History
                        </button>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 mb-6">
                            <button
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
                                onClick={() => setActiveTab('announcements')}
                            >
                                Announcements
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reports' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
                                onClick={() => setActiveTab('reports')}
                            >
                                Reports
                            </button>
                        </div>

                        {activeTab === 'announcements' && (
                            <>
                                {/* Management Header Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Announcements Management</h2>
                                        <p className="text-sm text-gray-500">Total announcements sent: {announcements.filter(a => a.status === 'sent').length}</p>
                                    </div>
                                    {/* ... rest of header ... */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${viewHistory ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => setViewHistory(!viewHistory)}>
                                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${viewHistory ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">View Sent History</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column: Compose Form */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {viewHistory ? (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                <h3 className="text-base font-bold text-gray-900 mb-6 flex justify-between items-center">
                                                    <span>Announcement History</span>
                                                    <button onClick={() => setViewHistory(false)} className="text-sm text-blue-600 hover:underline">Compose New</button>
                                                </h3>

                                                <div className="space-y-4">
                                                    {loadingHistory ? (
                                                        <p className="text-center text-gray-500 py-4">Loading history...</p>
                                                    ) : announcements.length === 0 ? (
                                                        <p className="text-center text-gray-500 py-4">No announcements sent yet.</p>
                                                    ) : (
                                                        announcements.map((ann) => (
                                                            <div key={ann._id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-bold text-gray-800">{ann.subject}</h4>
                                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{stripHtml(ann.body)}</p>
                                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1"><FaPaperPlane size={10} /> {ann.status}</span>
                                                                    <span className="flex items-center gap-1"><FaUsers size={10} /> {ann.scope === 'whole' ? `All ${ann.targetType}` : `${ann.selectedTargets.length} selected`}</span>
                                                                    {ann.attachments && ann.attachments.length > 0 && (
                                                                        <span className="flex items-center gap-1 text-blue-500 font-medium">
                                                                            <FaFileAlt size={10} /> {ann.attachments.length} files
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                <h3 className="text-base font-bold text-gray-900 mb-6">Compose New Announcement</h3>

                                                <div className="space-y-6">
                                                    {/* Subject */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Subject/Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter announcement subject..."
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                            value={announcementSubject}
                                                            onChange={(e) => setAnnouncementSubject(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Message Body */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Message Body</label>
                                                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => execCommand('bold')}
                                                                    className={`p-1.5 rounded transition ${activeFormats.bold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                                                                    title="Bold"
                                                                >
                                                                    <FaBold size={12} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => execCommand('italic')}
                                                                    className={`p-1.5 rounded transition ${activeFormats.italic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                                                                    title="Italic"
                                                                >
                                                                    <FaItalic size={12} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => execCommand('underline')}
                                                                    className={`p-1.5 rounded transition ${activeFormats.underline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                                                                    title="Underline"
                                                                >
                                                                    <FaUnderline size={12} />
                                                                </button>
                                                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => execCommand('insertUnorderedList')}
                                                                    className={`p-1.5 rounded transition ${activeFormats.listUl ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                                                                    title="Bullet List"
                                                                >
                                                                    <FaListUl size={12} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => execCommand('insertOrderedList')}
                                                                    className={`p-1.5 rounded transition ${activeFormats.listOl ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                                                                    title="Numbered List"
                                                                >
                                                                    <FaListOl size={12} />
                                                                </button>
                                                            </div>
                                                            <div
                                                                ref={editorRef}
                                                                contentEditable
                                                                onInput={handleEditorInput}
                                                                onKeyUp={updateActiveFormats}
                                                                onMouseUp={updateActiveFormats}
                                                                onFocus={updateActiveFormats}
                                                                className="w-full bg-gray-50 p-4 text-sm focus:outline-none min-h-[250px] overflow-y-auto wysiwyg-editor"
                                                                style={{
                                                                    whiteSpace: 'pre-wrap',
                                                                    outline: 'none'
                                                                }}
                                                            ></div>
                                                            <style dangerouslySetInnerHTML={{
                                                                __html: `
                                                                .wysiwyg-editor ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5rem !important; }
                                                                .wysiwyg-editor ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5rem !important; }
                                                                .wysiwyg-editor li { margin-bottom: 0.25rem !important; }
                                                            ` }} />
                                                        </div>
                                                    </div>

                                                    {/* Attachments */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Attachments</label>
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                            multiple
                                                        />
                                                        <div
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-gray-50 transition"
                                                        >
                                                            <FaCloudUploadAlt size={24} className="text-gray-400 mb-2" />
                                                            <p className="text-sm font-medium text-gray-600">Click to upload documents or images</p>
                                                            <p className="text-xs text-gray-400 mt-1">Multiple files supported</p>
                                                        </div>

                                                        {attachments.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                {attachments.map((file, index) => (
                                                                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                            <span className="text-blue-600"><FaFileAlt size={14} /></span>
                                                                            <span className="text-xs font-medium text-blue-800 truncate">{file.name}</span>
                                                                            <span className="text-[10px] text-blue-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                                                                            className="text-red-400 hover:text-red-600 p-1"
                                                                        >
                                                                            <FaTimes size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Target Audience - DYNAMIC */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Target Audience</label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Primary Scope Selector */}
                                                            <div>
                                                                <select
                                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer font-medium text-gray-700"
                                                                    value={targetScope}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setTargetScope(val);
                                                                        if (val === 'whole') {
                                                                            setSelectedTargets([]);
                                                                        } else if (val === 'selected' && adminInfo?.role === 'VILLAGE_ADMIN') {
                                                                            setTargetType('occupation');
                                                                        }
                                                                    }}
                                                                >
                                                                    {adminInfo?.role === 'VILLAGE_ADMIN' && (
                                                                        <>
                                                                            <option value="whole">Whole Village (All Members)</option>
                                                                            <option value="selected">Select by Occupation</option>
                                                                        </>
                                                                    )}
                                                                    {adminInfo?.role === 'MANDAL_ADMIN' && (
                                                                        <>
                                                                            <option value="whole">Whole Mandal (All Villages)</option>
                                                                            <option value="selected">Select Specific Villages</option>
                                                                        </>
                                                                    )}
                                                                    {adminInfo?.role === 'DISTRICT_ADMIN' && (
                                                                        <>
                                                                            <option value="whole">Whole District (All Mandals)</option>
                                                                            <option value="selected">Select Specific Mandals</option>
                                                                        </>
                                                                    )}
                                                                    {adminInfo?.role === 'STATE_ADMIN' && (
                                                                        <>
                                                                            <option value="whole">Whole State (All Districts)</option>
                                                                            <option value="selected">Select Specific Districts</option>
                                                                        </>
                                                                    )}
                                                                    {/* Fallback for safety/loading */}
                                                                    {!adminInfo && <option>Loading...</option>}
                                                                </select>
                                                            </div>

                                                            {/* Secondary Multi-Select (Only if 'selected' chosen) */}
                                                            <div>
                                                                {targetScope === 'selected' ? (
                                                                    loadingTargets ? (
                                                                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 animate-pulse">Loading options...</div>
                                                                    ) : (
                                                                        <MultiSelect
                                                                            options={availableTargets}
                                                                            selectedValues={selectedTargets}
                                                                            onChange={setSelectedTargets}
                                                                            placeholder={`Select ${targetType}`}
                                                                        />
                                                                    )
                                                                ) : (
                                                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 italic">
                                                                        Applicable to everyone in scope
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Selection Summary */}
                                                        <div className="mt-2 text-xs text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded font-medium">
                                                            <span>Target: </span>
                                                            <span className="font-bold">{getTargetDescription()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Schedule Options */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Schedule Options</label>
                                                        <div className="space-y-3">
                                                            <label className="flex items-center gap-3 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="schedule"
                                                                    checked={scheduleType === 'now'}
                                                                    onChange={() => setScheduleType('now')}
                                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                />
                                                                <span className="text-sm text-gray-700">Send Immediately</span>
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <label className="flex items-center gap-3 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="schedule"
                                                                        checked={scheduleType === 'later'}
                                                                        onChange={() => setScheduleType('later')}
                                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                    />
                                                                    <span className="text-sm text-gray-700">Schedule for Later</span>
                                                                </label>
                                                                {scheduleType === 'later' && (
                                                                    <input
                                                                        type="datetime-local"
                                                                        value={scheduledDate}
                                                                        onChange={(e) => setScheduledDate(e.target.value)}
                                                                        className="ml-4 border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                                        <button
                                                            onClick={() => setShowPreview(true)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-2"
                                                        >
                                                            <FaEye /> Preview
                                                        </button>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={handleSaveDraft} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition">Save as Draft</button>
                                                            <button onClick={handleCancel} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition">Cancel</button>
                                                            <button onClick={handleSend} className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                                                <FaPaperPlane size={12} /> Send Announcement
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Analytics (Same as before) - Truncated for brevity if needed but keeping structure */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <h3 className="text-base font-bold text-gray-900 mb-6">Analytics Summary</h3>
                                            <div className="mb-6">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm text-gray-500">Total Announcements</span>
                                                    <span className="text-2xl font-bold text-[#1e2a4a]">{announcements.length}</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#1e2a4a] w-[85%] rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="mb-6">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm text-gray-500">Avg. Delivery Rate</span>
                                                    <span className="text-2xl font-bold text-green-600">94%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-[94%] rounded-full"></div>
                                                </div>
                                            </div>
                                            {/* ... */}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'reports' && (
                            <div className="space-y-6">
                                {/* Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                                <FaBullhorn size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Total Announcements</p>
                                                <h3 className="text-2xl font-bold text-gray-900">{announcements.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                                <FaChartBar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Total Reach</p>
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    {announcements.reduce((acc, curr) => {
                                                        return acc + (curr.scope === 'whole' ? 100 : curr.selectedTargets.length); // Mock 100 for whole for now
                                                    }, 0)} (Est)
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                                <FaCalendarAlt size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Scheduled</p>
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    {announcements.filter(a => a.status === 'scheduled').length}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Chart */}
                                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Announcement Activity</h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={Object.entries(announcements.reduce((acc, curr) => {
                                                        const date = new Date(curr.createdAt).toLocaleDateString();
                                                        acc[date] = (acc[date] || 0) + 1;
                                                        return acc;
                                                    }, {})).map(([date, count]) => ({ date, count }))}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#1e2a4a" name="Announcements Sent" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Recent List Table Style */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                            {announcements.map((ann) => (
                                                <div key={ann._id} className="flex flex-col gap-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-gray-800 text-sm">{ann.subject}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${ann.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {ann.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(ann.createdAt).toLocaleDateString()} • {ann.scope === 'whole' ? `All ${ann.targetType}` : `${ann.selectedTargets.length} Targets`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">Preview Announcement</h2>
                            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-red-500 text-2xl font-bold">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Subject</h3>
                                <p className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                                    {announcementSubject || <span className="text-gray-400 italic">No subject entered</span>}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Message Body</h3>
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-800 min-h-[100px]"
                                    dangerouslySetInnerHTML={{
                                        __html: announcementBody || '<span class="text-gray-400 italic">No content entered</span>'
                                    }}
                                ></div>
                            </div>
                            {attachments.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Attachments ({attachments.length})</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((file, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                                                <FaFileAlt size={10} className="text-gray-400" />
                                                {file.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Target Audience</h3>
                                    <p className="text-sm font-medium text-blue-600">{getTargetDescription() || "None Selected"}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Schedule</h3>
                                    <p className="text-sm font-medium text-gray-700">
                                        {scheduleType === 'now' ? 'Send Immediately' : `Scheduled for: ${scheduledDate || 'Not set'}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                            <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition">
                                Close Preview
                            </button>
                            <button onClick={() => { setShowPreview(false); handleSend(); }} className="px-4 py-2 bg-[#1e2a4a] text-white rounded-lg text-sm font-bold hover:bg-[#2a3b66] transition flex items-center gap-2">
                                <FaPaperPlane /> Send Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
