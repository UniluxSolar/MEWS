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

const MultiSelect = ({ options, selectedValues, onChange, placeholder, labelKey = 'name', valueKey = '_id', disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

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
        if (disabled) return;
        const value = option[valueKey];
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(newSelection);
    };

    const getDisplayLabel = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
            const selected = options.find(o => o[valueKey] === selectedValues[0]);
            return selected ? selected[labelKey] : placeholder;
        }
        return `${selectedValues.length} items selected`;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm flex justify-between items-center transition-all duration-200 ${disabled
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70'
                        : 'bg-white border-gray-200 cursor-pointer hover:border-blue-400 shadow-sm'
                    }`}
            >
                <span className={selectedValues.length === 0 ? 'text-gray-400 italic' : 'text-gray-800 font-bold'}>
                    {getDisplayLabel()}
                </span>
                <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen && !disabled ? 'rotate-180' : ''}`} size={12} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.length > 0 ? (
                        options.map(option => {
                            const isSelected = selectedValues.includes(option[valueKey]);
                            return (
                                <div
                                    key={option[valueKey]}
                                    onClick={() => toggleOption(option)}
                                    className={`px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition ${isSelected ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className={`${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                                        {isSelected ? <FaCheckSquare size={16} /> : <FaSquare size={16} />}
                                    </div>
                                    <span className={isSelected ? 'font-bold text-blue-900 underline decoration-blue-200 decoration-2 underline-offset-2' : 'text-gray-700'}>
                                        {option[labelKey]}
                                        {option.surname && ` ${option.surname}`}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-6 text-sm text-gray-500 text-center font-medium italic">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AdminAnnouncements = () => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [viewHistory, setViewHistory] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // Detail view modal

    // State for Role & Logic
    const [adminInfo, setAdminInfo] = useState(null);
    const [targetScope, setTargetScope] = useState(''); // 'whole', 'selected'
    const [targetType, setTargetType] = useState(''); // 'villages', 'mandals', 'districts', 'members'
    const [availableTargets, setAvailableTargets] = useState([]);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [loadingTargets, setLoadingTargets] = useState(false);

    // Hierarchical Selection State
    const [availableConstituencies, setAvailableConstituencies] = useState([]);
    const [selectedConstituencies, setSelectedConstituencies] = useState([]);
    const [availableMandals, setAvailableMandals] = useState([]);
    const [selectedMandals, setSelectedMandals] = useState([]);
    const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
    const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);
    const [selectedWards, setSelectedWards] = useState([]);
    const [availableVillages, setAvailableVillages] = useState([]);
    const [selectedVillages, setSelectedVillages] = useState([]);
    const [loadingHierarchy, setLoadingHierarchy] = useState({
        constituencies: false,
        mandals: false,
        municipalities: false,
        villages: false,
        wards: false
    });
    const [areaType, setAreaType] = useState('rural'); // 'rural', 'urban'
    const [recipientType, setRecipientType] = useState('members'); // 'admins', 'members'

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
        const info = sessionStorage.getItem('adminInfo'); // Consistency with sidebar
        if (info) {
            const parsed = JSON.parse(info);
            // Ensure consistency between assignedLocation and location_id (internal to this component)
            const effectiveInfo = {
                ...parsed,
                assignedLocation: parsed.assignedLocation || parsed.location_id || parsed.district_id || parsed.mandal_id
            };
            setAdminInfo(effectiveInfo);

            const role = (effectiveInfo.role || '').toUpperCase();
            const isSuper = role === 'SUPER_ADMIN';
            const isState = role === 'STATE_ADMIN';
            const isDistrict = role === 'DISTRICT_ADMIN';
            const isMandal = role === 'MANDAL_ADMIN';
            const isMunicipality = role === 'MUNICIPALITY_ADMIN';
            const isVillage = role === 'VILLAGE_ADMIN';
            const isWard = role === 'WARD_ADMIN';

            // Set Default Scope & View Mode
            if (isSuper || isState) setTargetType('districts');
            else if (isDistrict) setTargetType('districts');
            else if (isMandal) setTargetType('mandals');
            else if (isMunicipality) setTargetType('municipalities');
            else if (isVillage) setTargetType('villages');
            else if (isWard) setTargetType('wards');
            else setTargetType('members');

            setTargetScope('whole');
            
            // Default regular admins to history view to see incoming announcements
            // But State, Super and now District Admins should see Compose by default
            if (!isSuper && !isState && !isDistrict) {
                setViewHistory(true);
            }
        }
    }, []);

    // Fetch Targets when needed
    useEffect(() => {
        const fetchTargets = async () => {
            if ((targetScope !== 'selected' && targetScope !== 'municipalities' && targetScope !== 'both') || !adminInfo) return;

            setLoadingTargets(true);
            setCurrentlySelectedLabel(); // Reset label logic or handle elsewhere

            try {
                let endpoint = '';
                let params = {};

                if (targetType === 'members') {
                    // Village Admin fetching members
                    setLoadingTargets(true);
                    try {
                        const villageId = adminInfo.assignedLocation;
                        // Fetch only members belonging to this village
                        const endpoint = `/members?limit=all${villageId ? `&address.village=${villageId}` : ''}`;
                        const { data } = await API.get(endpoint);
                        
                        // Backend returns { members: [], total: ... }
                        const membersList = data.members || (Array.isArray(data) ? data : []);

                        // Exclude current admin if they are also a member
                        const mewsIdToExclude = adminInfo?.mewsId || adminInfo?.username;
                        const filtered = membersList
                            .filter(m => m.mewsId !== mewsIdToExclude)
                            .map(m => ({
                                ...m,
                                // MultiSelect component already appends surname if it exists (see line 84)
                                // So we just need to ensure 'name' has the first name or fallback
                                name: m.name || m.mewsId
                            }));
                        setAvailableTargets(filtered);
                    } catch (err) {
                        console.error("Failed to fetch members:", err);
                    } finally {
                        setLoadingTargets(false);
                    }
                } else if (targetType === 'occupation') {
                    // Static Occupation List mapped to expected format
                    setAvailableTargets(memberOccupations.map(occ => ({ _id: occ, name: occ })));
                } else {
                    // Fetching Locations
                    if (targetType === 'both') {
                        const baseUrl = `/locations?ancestor=${adminInfo.assignedLocation}`;
                        const [mandalsRes, munisRes] = await Promise.all([
                            API.get(`${baseUrl}&type=MANDAL`),
                            API.get(`${baseUrl}&type=MUNICIPALITY`)
                        ]);
                        setAvailableMandals(mandalsRes.data);
                        setAvailableMunicipalities(munisRes.data);
                        setAvailableTargets([...mandalsRes.data, ...munisRes.data]);
                    } else {
                        let type = '';
                        if (targetType === 'villages') type = 'VILLAGE';
                        if (targetType === 'wards') type = 'WARD';
                        if (targetType === 'mandals') type = 'MANDAL';
                        if (targetType === 'municipalities') type = 'MUNICIPALITY';
                        if (targetType === 'districts') type = 'DISTRICT';

                        let endpoint = `/locations?type=${type}`;
                        if (adminInfo.assignedLocation) {
                            // Use ancestor instead of parent to handle intermediate layers like CONSTITUENCY
                            endpoint += `&ancestor=${adminInfo.assignedLocation}`;
                        }

                        const { data } = await API.get(endpoint);
                        setAvailableTargets(data);
                        
                        if (targetType === 'mandals') setAvailableMandals(data);
                        if (targetType === 'municipalities') setAvailableMunicipalities(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch targets", error);
            } finally {
                setLoadingTargets(false);
            }
        };

        fetchTargets();
    }, [targetScope, targetType, adminInfo]);

    // FETCH HIERARCHICAL CHILD DATA
    // Fetch Constituencies when Districts change
    useEffect(() => {
        const fetchConstituencies = async () => {
            if (targetType !== 'districts' || targetScope !== 'selected' || selectedTargets.length === 0) {
                setAvailableConstituencies([]);
                return;
            }

            setLoadingHierarchy(prev => ({ ...prev, constituencies: true }));
            try {
                // Modified backend now supports comma separated parents
                const { data } = await API.get(`/locations?type=CONSTITUENCY&parent=${selectedTargets.join(',')}`);
                setAvailableConstituencies(data);
            } catch (error) {
                console.error("Failed to fetch constituencies", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, constituencies: false }));
            }
        };

        fetchConstituencies();
    }, [selectedTargets, targetType, targetScope]);

    // Fetch Mandals when Constituencies change
    useEffect(() => {
        const fetchMandals = async () => {
            if (selectedConstituencies.length === 0) {
                setAvailableMandals([]);
                return;
            }

            setLoadingHierarchy(prev => ({ ...prev, mandals: true }));
            try {
                const type = areaType === 'rural' ? 'MANDAL' : 'MUNICIPALITY';
                const { data } = await API.get(`/locations?type=${type}&parent=${selectedConstituencies.join(',')}`);
                setAvailableMandals(data);
            } catch (error) {
                console.error("Failed to fetch mandals", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, mandals: false }));
            }
        };

        fetchMandals();
    }, [selectedConstituencies, areaType]);

    // Fetch Villages when Mandals change
    useEffect(() => {
        const fetchVillages = async () => {
            if (selectedMandals.length === 0) {
                setAvailableVillages([]);
                return;
            }

            setLoadingHierarchy(prev => ({ ...prev, villages: true }));
            try {
                const type = areaType === 'rural' ? 'VILLAGE' : 'WARD';
                const { data } = await API.get(`/locations?type=${type}&parent=${selectedMandals.join(',')}`);
                setAvailableVillages(data);
            } catch (error) {
                console.error("Failed to fetch villages", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, villages: false }));
            }
        };

        fetchVillages();
    }, [selectedMandals, areaType]);

    // Fetch Mandals/Municipalities when Target Scope changes
    useEffect(() => {
        const fetchGlobalMandals = async () => {
            // Dropdown uses 'selected' for mandals in District Admin case
            if (targetScope !== 'selected' && targetScope !== 'both' && targetScope !== 'mandals') {
                setAvailableMandals([]);
                return;
            }
            setLoadingHierarchy(prev => ({ ...prev, mandals: true }));
            try {
                let endpoint = '/locations?type=MANDAL';
                if (adminInfo?.assignedLocation) {
                    endpoint += `&ancestor=${adminInfo.assignedLocation}`;
                }
                const { data } = await API.get(endpoint);
                setAvailableMandals(data);
            } catch (error) {
                console.error("Failed to fetch mandals", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, mandals: false }));
            }
        };

        const fetchGlobalMunicipalities = async () => {
            if (targetScope !== 'municipalities' && targetScope !== 'both') {
                setAvailableMunicipalities([]);
                return;
            }
            setLoadingHierarchy(prev => ({ ...prev, municipalities: true }));
            try {
                let endpoint = '/locations?type=MUNICIPALITY';
                if (adminInfo?.assignedLocation) {
                    endpoint += `&ancestor=${adminInfo.assignedLocation}`;
                }
                const { data } = await API.get(endpoint);
                setAvailableMunicipalities(data);
            } catch (error) {
                console.error("Failed to fetch municipalities", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, municipalities: false }));
            }
        };

        fetchGlobalMandals();
        fetchGlobalMunicipalities();
    }, [targetScope, adminInfo]);

    // Fetch Villages for Mandals
    useEffect(() => {
        const fetchVillages = async () => {
            if (areaType === 'rural' ? selectedMandals.length === 0 : selectedMandals.length === 0) {
                setAvailableVillages([]);
                return;
            }
            setLoadingHierarchy(prev => ({ ...prev, villages: true }));
            try {
                const type = areaType === 'rural' ? 'VILLAGE' : 'WARD';
                const { data } = await API.get(`/locations?type=${type}&parent=${selectedMandals.join(',')}`);
                setAvailableVillages(data);
            } catch (error) {
                console.error("Failed to fetch sub-locations", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, villages: false }));
            }
        };
        fetchVillages();
    }, [selectedMandals, areaType]);

    // Handlers for manual selection logic
    const handleDistrictChange = (newTargets) => {
        setSelectedTargets(newTargets);
        setSelectedConstituencies([]);
        setSelectedVillages([]);
        setSelectedWards([]);

        if (adminInfo?.role === 'DISTRICT_ADMIN') {
            if (targetType === 'mandals') {
                setSelectedMandals(newTargets);
                setSelectedMunicipalities([]);
            } else if (targetType === 'municipalities') {
                setSelectedMunicipalities(newTargets);
                setSelectedMandals([]);
            } else {
                setSelectedMandals([]);
                setSelectedMunicipalities([]);
            }
        } else {
            setSelectedMandals([]);
            setSelectedMunicipalities([]);
        }
    };

    const handleConstituencyChange = (newConstituencies) => {
        setSelectedConstituencies(newConstituencies);
    };

    const handleMandalChange = (newMandals) => {
        setSelectedMandals(newMandals);
        setSelectedVillages([]);
    };

    const handleMunicipalityChange = (newMunicipalities) => {
        setSelectedMunicipalities(newMunicipalities);
        setSelectedWards([]);
    };

    const handleVillageChange = (newVillages) => {
        setSelectedVillages(newVillages);
    };

    const handleWardChange = (newWards) => {
        setSelectedWards(newWards);
    };

    // Fetch Wards for Municipalities
    useEffect(() => {
        const fetchWards = async () => {
            if (selectedMunicipalities.length === 0) {
                setAvailableWards([]);
                return;
            }
            setLoadingHierarchy(prev => ({ ...prev, wards: true }));
            try {
                const { data } = await API.get(`/locations?type=WARD&parent=${selectedMunicipalities.join(',')}`);
                setAvailableWards(data);
            } catch (error) {
                console.error("Failed to fetch sub-locations (wards)", error);
            } finally {
                setLoadingHierarchy(prev => ({ ...prev, wards: false }));
            }
        };
        fetchWards();
    }, [selectedMunicipalities]);

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
        const role = adminInfo?.role || '';
        const isSuper = role === 'SUPER_ADMIN';
        const isState = role === 'STATE_ADMIN';
        
        if (targetScope === 'whole') {
            if (isSuper || role === 'DISTRICT_ADMIN') return `All Districts`;
            if (isState) return `Whole State`;
            if (role === 'MANDAL_ADMIN') return 'Whole Mandal';
            if (role === 'MUNICIPALITY_ADMIN') return 'Whole Municipality';
            if (role === 'VILLAGE_ADMIN') return 'Whole Village';
            if (role === 'WARD_ADMIN') return 'Whole Ward';
            return 'Full Jurisdiction';
        } else {
            if (selectedTargets.length === 0 && selectedMandals.length === 0 && selectedMunicipalities.length === 0) {
                return `No targets selected`;
            }
            
            // Detailed description for combined modes
            if (targetType === 'both') {
                let parts = [];
                if (selectedMandals.length > 0) parts.push(`${selectedMandals.length} Mandals`);
                if (selectedMunicipalities.length > 0) parts.push(`${selectedMunicipalities.length} Municipalities`);
                return `Targeting ${parts.join(' & ')} (Combined)`;
            }

            if (selectedWards.length > 0) return `Targeting ${selectedWards.length} Ward(s) in selected Municipalities`;
            if (selectedVillages.length > 0) return `Targeting ${selectedVillages.length} Village(s) in selected Mandals`;
            
            if (selectedMunicipalities.length > 0) return `Targeting All in ${selectedMunicipalities.length} Municipality(ies)`;
            if (selectedMandals.length > 0) return `Targeting All in ${selectedMandals.length} Mandal(s)`;

            if (selectedConstituencies.length > 0) {
                return `Targeting ${selectedConstituencies.length} Constituencies in ${selectedTargets.length} District(s)`;
            }
            return `Targeting All in ${selectedTargets.length} ${targetType || 'District(s)'}`;
        }
    };

    const setCurrentlySelectedLabel = () => {
        // Trigger re-render mostly
    };

    const handleSend = async () => {
        if (!announcementSubject || !announcementBody || !targetScope) {
            alert('Please fill in all required fields (Subject, Body, and Target Audience)');
            return;
        }

        if (targetScope === 'selected' && selectedTargets.length === 0) {
            const label = targetType === 'mandals' ? 'mandal' : 'district';
            alert(`Please select at least one ${label} to proceed.`);
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
            
            // Payload construction for combined modes
            let finalTargets = [];
            let effectiveType = targetType;

            if (targetType === 'both') {
                // Return a structured object for the backend to handle dual sectors
                const combined = {
                    mandals: selectedMandals,
                    villages: selectedVillages,
                    municipalities: selectedMunicipalities,
                    wards: selectedWards
                };
                formData.append('combinedTargets', JSON.stringify(combined));
                effectiveType = 'combined';
            } else {
                if (selectedWards.length > 0) {
                    finalTargets = selectedWards;
                    effectiveType = 'wards';
                } else if (selectedVillages.length > 0) {
                    finalTargets = selectedVillages;
                    effectiveType = 'villages';
                } else if (selectedMunicipalities.length > 0) {
                    finalTargets = selectedMunicipalities;
                    effectiveType = 'municipalities';
                } else if (selectedMandals.length > 0) {
                    finalTargets = selectedMandals;
                    effectiveType = 'mandals';
                } else if (selectedConstituencies.length > 0) {
                    finalTargets = selectedConstituencies;
                    effectiveType = 'constituencies';
                } else {
                    finalTargets = selectedTargets;
                    effectiveType = targetType || 'districts';
                }
            }

            formData.append('targetType', effectiveType);
            formData.append('selectedTargets', JSON.stringify(finalTargets));
            formData.append('targetDescription', getTargetDescription());
            formData.append('schedule', scheduleType);
            if (scheduleType === 'later') {
                formData.append('scheduledDate', scheduledDate);
            }
            formData.append('areaType', areaType);
            formData.append('recipientType', recipientType);
            formData.append('selectedMandalsCount', selectedMandals.length);
            formData.append('selectedMunicipalitiesCount', selectedMunicipalities.length);

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await API.post('/announcements/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(scheduleType === 'later' ? 'Announcement Scheduled Successfully!' : 'Announcement Sent Successfully!');

            // Reset Form
            setAnnouncementSubject('');
            setAnnouncementBody('');
            setTargetScope('whole');
            setSelectedTargets([]);
            setSelectedConstituencies([]);
            setSelectedMandals([]);
            setSelectedVillages([]);
            setAttachments([]);
            setScheduleType('now');
            setScheduledDate('');
            setAreaType('rural');

            // Refresh History
            fetchAnnouncements();
            setViewHistory(true); // Switch to history view

        } catch (error) {
            console.error("Failed to process announcement", error);
            const errBody = error.response ? (error.response.data.message || error.response.statusText) : error.message;
            alert('Failed to process announcement: ' + errBody);
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
            
            // Cascading Selection Logic for Drafts
            let finalTargets = [];
            let effectiveType = targetType || 'districts';

            if (selectedVillages.length > 0) {
                finalTargets = selectedVillages;
                effectiveType = areaType === 'rural' ? 'villages' : 'wards';
            } else if (selectedMandals.length > 0) {
                finalTargets = selectedMandals;
                effectiveType = areaType === 'rural' ? 'mandals' : 'municipalities';
            } else if (selectedConstituencies.length > 0) {
                finalTargets = selectedConstituencies;
                effectiveType = 'constituencies';
            } else {
                finalTargets = selectedTargets || [];
                effectiveType = 'districts';
            }

            formData.append('targetType', effectiveType);
            formData.append('selectedTargets', JSON.stringify(finalTargets));
            formData.append('schedule', 'now');
            formData.append('status', 'draft');
            formData.append('areaType', areaType);

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await API.post('/announcements/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Draft Saved Successfully!');
            // Reset Form
            setAnnouncementSubject('');
            setAnnouncementBody('');
            setTargetScope('whole');
            setSelectedTargets([]);
            setSelectedConstituencies([]);
            setSelectedMandals([]);
            setSelectedVillages([]);
            setAttachments([]);
            setAreaType('rural');
            fetchAnnouncements();
            setViewHistory(true);
        } catch (error) {
            console.error("Failed to save draft", error);
            const errBody = error.response ? (error.response.data.message || error.response.statusText) : error.message;
            alert('Failed to save draft: ' + errBody);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel? Any unsaved text will be lost.")) {
            setAnnouncementSubject('');
            setAnnouncementBody('');
            setTargetScope('whole');
            setSelectedTargets([]);
            setSelectedConstituencies([]);
            setSelectedMandals([]);
            setSelectedVillages([]);
            setAttachments([]);
            setAreaType('rural');
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
                                                        <p className="text-center text-gray-500 py-4">No announcements available for your region.</p>
                                                    ) : (
                                                        announcements.map((ann) => (
                                                            <div 
                                                                key={ann._id} 
                                                                className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer group"
                                                                onClick={() => setSelectedAnnouncement(ann)}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-wide">{ann.subject}</h4>
                                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{stripHtml(ann.body)}</p>
                                                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                                    <span className="flex items-center gap-1.5"><FaPaperPlane size={10} className="text-blue-400" /> {ann.status}</span>
                                                                    <span className="flex items-center gap-1.5"><FaUsers size={10} className="text-purple-400" /> {ann.scope === 'whole' ? `State-Wide` : `Targeted`}</span>
                                                                    {ann.attachments && ann.attachments.length > 0 && (
                                                                        <span className="flex items-center gap-1.5 text-blue-500">
                                                                            <FaFileAlt size={10} /> {ann.attachments.length} files
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-2 text-[9px] text-gray-300 italic">
                                                                    Sent by: {ann.sender?.name} ({ann.sender?.role})
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
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                            {/* Primary Scope Selector */}
                                                            <div className="w-full">
                                                                <div className="flex items-center justify-between mb-1.5 min-h-[15px]">
                                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Audience</label>
                                                                    <div className="flex items-center gap-4 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                                                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                                                            <input 
                                                                                type="radio" 
                                                                                name="recipientType" 
                                                                                value="admins"
                                                                                checked={recipientType === 'admins'} 
                                                                                onChange={() => setRecipientType('admins')} 
                                                                                className="w-3 h-3 text-blue-600 focus:ring-0 border-gray-300 transition-all cursor-pointer" 
                                                                            />
                                                                            <span className={`text-[9px] font-bold uppercase tracking-tight ${recipientType === 'admins' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'} transition-all`}>Admins</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                                                            <input 
                                                                                type="radio" 
                                                                                name="recipientType" 
                                                                                value="members"
                                                                                checked={recipientType === 'members'} 
                                                                                onChange={() => setRecipientType('members')} 
                                                                                className="w-3 h-3 text-blue-600 focus:ring-0 border-gray-300 transition-all cursor-pointer" 
                                                                            />
                                                                            <span className={`text-[9px] font-bold uppercase tracking-tight ${recipientType === 'members' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'} transition-all`}>Members</span>
                                                                        </label>
                                                                        {(adminInfo?.role === 'SUPER_ADMIN' || adminInfo?.role === 'STATE_ADMIN') && (
                                                                            <label className="flex items-center gap-1.5 cursor-pointer group">
                                                                                <input 
                                                                                    type="radio" 
                                                                                    name="recipientType" 
                                                                                    value="both"
                                                                                    checked={recipientType === 'both'} 
                                                                                    onChange={() => setRecipientType('both')} 
                                                                                    className="w-3 h-3 text-blue-600 focus:ring-0 border-gray-300 transition-all cursor-pointer" 
                                                                                />
                                                                                <span className={`text-[9px] font-bold uppercase tracking-tight ${recipientType === 'both' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'} transition-all`}>Both</span>
                                                                            </label>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <select
                                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer font-medium text-gray-700 shadow-sm transition-all"
                                                                    value={targetScope}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setTargetScope(val);
                                                                        
                                                                        // Role-based targetType adjustment
                                                                        const role = adminInfo?.role;
                                                                        if (role === 'DISTRICT_ADMIN') {
                                                                            if (val === 'selected') setTargetType('mandals');
                                                                            else if (val === 'municipalities') setTargetType('municipalities');
                                                                            else if (val === 'both') setTargetType('both');
                                                                            else setTargetType('districts');

                                                                            // Auto-set Area Type
                                                                            if (val === 'municipalities') setAreaType('urban');
                                                                            else if (val === 'selected') setAreaType('rural');
                                                                        } else if (role === 'MANDAL_ADMIN') {
                                                                            if (val === 'selected') setTargetType('villages');
                                                                            else setTargetType('mandals');
                                                                            setAreaType('rural');
                                                                        } else if (role === 'VILLAGE_ADMIN') {
                                                                            if (val === 'selected') setTargetType('members');
                                                                            else setTargetType('villages');
                                                                        } else if (role === 'MUNICIPALITY_ADMIN') {
                                                                            if (val === 'selected') setTargetType('wards');
                                                                            else setTargetType('municipalities');
                                                                            setAreaType('urban');
                                                                        }

                                                                        if (val === 'whole') {
                                                                            setSelectedTargets([]);
                                                                            setSelectedConstituencies([]);
                                                                            setSelectedMandals([]);
                                                                            setSelectedVillages([]);

                                                                            // Auto-broaden for Super Admin global broadcasts
                                                                            if (adminInfo?.role === 'SUPER_ADMIN' || adminInfo?.role === 'STATE_ADMIN') {
                                                                                setRecipientType('both');
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="whole">
                                                                        {adminInfo?.role === 'DISTRICT_ADMIN' ? 'All Districts' :
                                                                         (adminInfo?.role === 'SUPER_ADMIN' || adminInfo?.role === 'STATE_ADMIN') ? 'Whole State (All Districts)' : 
                                                                         adminInfo?.role === 'MANDAL_ADMIN' ? 'Whole Mandal' :
                                                                         adminInfo?.role === 'MUNICIPALITY_ADMIN' ? 'Whole Municipality' :
                                                                         adminInfo?.role === 'VILLAGE_ADMIN' ? 'Whole Village' :
                                                                         adminInfo?.role === 'WARD_ADMIN' ? 'Whole Ward' : 'My Full Jurisdiction'}
                                                                    </option>
                                                                    <option value="selected">
                                                                        {adminInfo?.role === 'DISTRICT_ADMIN' ? 'Select Mandals' :
                                                                         (adminInfo?.role === 'SUPER_ADMIN' || adminInfo?.role === 'STATE_ADMIN') ? 'Select Districts' : 
                                                                         adminInfo?.role === 'MANDAL_ADMIN' ? 'Select Villages' :
                                                                         adminInfo?.role === 'MUNICIPALITY_ADMIN' ? 'Select Wards' : 
                                                                         adminInfo?.role === 'VILLAGE_ADMIN' ? 'Select Members' : 'Custom Selection'}
                                                                    </option>
                                                                    {adminInfo?.role === 'DISTRICT_ADMIN' && (
                                                                        <>
                                                                            <option value="municipalities">Select Municipalities</option>
                                                                            <option value="both">Select Mandals & Municipalities</option>
                                                                        </>
                                                                    )}
                                                                </select>
                                                            </div>

                                                            {/* Select District(s) / Mandal(s) / Municipalities - Side by Side (Center) */}
                                                            <div className="w-full">
                                                                {(targetScope === 'selected' || targetScope === 'municipalities') && (targetType === 'districts' || targetType === 'mandals' || targetType === 'municipalities' || targetType === 'villages' || targetType === 'wards' || targetType === 'members') ? (
                                                                    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                                                            {targetType === 'members' ? 'Select Members' : `Select ${targetType === 'mandals' ? 'Mandal(s)' : targetType === 'municipalities' ? 'Municipality(ies)' : targetType === 'villages' ? 'Village(s)' : targetType === 'wards' ? 'Ward(s)' : 'District(s)'}`} <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <MultiSelect
                                                                            options={availableTargets}
                                                                            selectedValues={selectedTargets}
                                                                            onChange={handleDistrictChange}
                                                                            placeholder={targetType === 'members' ? "Choose Members" : targetType === 'mandals' ? "Choose Mandals" : targetType === 'municipalities' ? "Choose Municipalities" : targetType === 'villages' ? "Choose Villages" : targetType === 'wards' ? "Choose Wards" : "Choose Districts"}
                                                                            disabled={loadingTargets}
                                                                        />
                                                                    </div>
                                                                ) : targetScope === 'both' ? (
                                                                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                                                        <div>
                                                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Select Mandals</label>
                                                                            <MultiSelect
                                                                                options={availableMandals}
                                                                                selectedValues={selectedMandals}
                                                                                onChange={handleMandalChange}
                                                                                placeholder="Choose Mandals"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Select Municipalities</label>
                                                                            <MultiSelect
                                                                                options={availableMunicipalities}
                                                                                selectedValues={selectedMunicipalities}
                                                                                onChange={handleMunicipalityChange}
                                                                                placeholder="Choose Municipalities"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-[43px] invisible"></div>
                                                                )}
                                                            </div>

                                                            {/* Selection Summary Badge - End Position */}
                                                            <div className="w-full">
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Selection Status</label>
                                                                <div className="h-[43px] flex items-center px-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm border-dashed">
                                                                    <p className="text-[11px] font-bold text-blue-600 truncate w-full flex items-center gap-2">
                                                                        <FaUsers className="shrink-0 text-blue-400" /> 
                                                                        <span className="truncate">{getTargetDescription() || "No selection"}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Hierarchical Sub-Selections - Dynamic per mode */}
                                                        {targetScope !== 'whole' && (selectedTargets.length > 0 || selectedMandals.length > 0 || selectedMunicipalities.length > 0) && (
                                                            <div className="mt-8 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-2 duration-500 space-y-8">
                                                                
                                                                {/* Area Type Toggle (Only for standard Districts mode) */}
                                                                {targetType === 'districts' && (
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Area Type</label>
                                                                        <div className="flex items-center gap-6">
                                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                                <input type="radio" name="areaType" checked={areaType === 'rural'} onChange={() => setAreaType('rural')} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                                                <span className="text-[13px] text-gray-700">Rural (Mandal/Village)</span>
                                                                            </label>
                                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                                <input type="radio" name="areaType" checked={areaType === 'urban'} onChange={() => setAreaType('urban')} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                                                <span className="text-[13px] text-gray-700">Urban (Municipality/Ward)</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Child Area Selection Grid */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    {/* Rural Sub-Area */}
                                                                    {(targetType === 'districts' && areaType === 'rural') || targetType === 'mandals' || targetType === 'both' ? (
                                                                        <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-100/50">
                                                                            <h4 className="text-[10px] font-black text-orange-600 uppercase mb-4 tracking-widest">Rural Target Detail</h4>
                                                                            <div className="space-y-4">
                                                                                {targetType === 'districts' && (
                                                                                    <div>
                                                                                        <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Constituency</label>
                                                                                        <MultiSelect options={availableConstituencies} selectedValues={selectedConstituencies} onChange={handleConstituencyChange} placeholder="Filter Constituency" disabled={loadingHierarchy.constituencies} />
                                                                                    </div>
                                                                                )}
                                                                                {targetType === 'districts' && (
                                                                                    <div>
                                                                                        <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Mandal</label>
                                                                                        <MultiSelect options={availableMandals} selectedValues={selectedMandals} onChange={handleMandalChange} placeholder="Filter Mandal" disabled={loadingHierarchy.mandals} />
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Specific Village(s)</label>
                                                                                    <MultiSelect options={availableVillages} selectedValues={selectedVillages} onChange={handleVillageChange} placeholder="Select villages (optional)..." disabled={loadingHierarchy.villages} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}

                                                                    {/* Urban Sub-Area */}
                                                                    {(targetType === 'districts' && areaType === 'urban') || targetType === 'municipalities' || targetType === 'both' ? (
                                                                        <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                                                                            <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Urban Target Detail</h4>
                                                                            <div className="space-y-4">
                                                                                {targetType === 'districts' && (
                                                                                    <div>
                                                                                        <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Municipality</label>
                                                                                        <MultiSelect options={availableMandals} selectedValues={selectedMandals} onChange={handleMandalChange} placeholder="Filter Municipality" disabled={loadingHierarchy.mandals} />
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Ward Number(s)</label>
                                                                                    <MultiSelect options={availableWards} selectedValues={selectedWards} onChange={handleWardChange} placeholder="Select wards (optional)..." disabled={loadingHierarchy.wards} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        )}
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
            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in active:scale-95 transition-transform duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#1e2a4a] leading-tight uppercase tracking-tight">{selectedAnnouncement.subject}</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                    <FaCalendarAlt className="text-blue-500" /> {new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    Sent by: {selectedAnnouncement.sender?.name} {selectedAnnouncement.sender?.surname}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div 
                                className="text-gray-700 leading-relaxed text-sm prose max-w-none wysiwyg-content"
                                dangerouslySetInnerHTML={{ __html: selectedAnnouncement.body }}
                            />
                            
                            <style dangerouslySetInnerHTML={{ __html: `
                                .wysiwyg-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 1rem !important; margin-bottom: 1rem !important; }
                                .wysiwyg-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 1rem !important; margin-bottom: 1rem !important; }
                                .wysiwyg-content li { margin-bottom: 0.5rem !important; }
                                .wysiwyg-content p { margin-bottom: 1rem !important; }
                                .wysiwyg-content strong { color: #1e2a4a !important; font-weight: 800 !important; }
                            ` }} />

                            {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                                <div className="mt-10 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-black text-[#1e2a4a] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FaCloudUploadAlt className="text-blue-500" /> Attachments ({selectedAnnouncement.attachments.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedAnnouncement.attachments.map((file, idx) => {
                                            const fileName = file.split('/').pop().split('-').slice(1).join('-') || 'Attachment';
                                            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file);
                                            const fullUrl = file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/\\/g, '/')}`;
                                            
                                            return (
                                                <a 
                                                    key={idx}
                                                    href={fullUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all group shadow-sm"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                        {isImage ? <FaImages size={18} /> : <FaFileAlt size={18} />}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-[11px] font-bold text-gray-700 truncate group-hover:text-blue-700">{fileName}</p>
                                                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Click to View</p>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedAnnouncement.scope === 'whole' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {selectedAnnouncement.scope === 'whole' ? 'State Wide' : 'Targeted Broadcast'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="px-6 py-2 bg-[#1e2a4a] hover:bg-[#2a3b66] text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
