import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaHeart, FaGraduationCap, FaHeartbeat, FaBalanceScale, FaCheckCircle,
    FaLock, FaCreditCard, FaUserSecret, FaInfoCircle, FaHandHoldingHeart, FaBriefcase, FaArrowLeft
} from 'react-icons/fa';

// --- Sub-components (Internal) ---

const PurposeCard = ({ icon: Icon, title, description, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`cursor-pointer relative p-5 rounded-xl border-2 transition-all duration-200 group
        ${selected
                ? 'border-primary bg-blue-50/50 shadow-md ring-0'
                : 'border-transparent bg-white shadow-sm hover:shadow-md hover:bg-gray-50 ring-1 ring-gray-100'}`}
    >
        <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                ${selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary layer-shadow'}`}>
                <Icon size={16} />
            </div>
            <div>
                <h3 className={`font-bold text-sm mb-1 ${selected ? 'text-primary' : 'text-gray-800'}`}>{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{description}</p>
            </div>
        </div>
        {selected && (
            <div className="absolute top-3 right-3 text-primary">
                <FaCheckCircle size={14} />
            </div>
        )}
    </div>
);

const AmountButton = ({ amount, value, selected, onClick, isPopular }) => (
    <div className="relative flex-1 min-w-[100px]">
        {isPopular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1e2a4a] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full z-10 shadow-sm border border-white">
                Most Popular
            </div>
        )}
        <button
            onClick={() => onClick(value)}
            className={`w-full py-4 px-2 rounded-xl font-bold text-lg border-2 transition-all duration-200
            ${selected
                    ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-lg transform -translate-y-1'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
        >
            ₹{amount}
        </button>
    </div>
);

// --- Main Component ---

const Donate = () => {
    const navigate = useNavigate();
    const [donationType, setDonationType] = useState('one-time');
    const [purpose, setPurpose] = useState(''); // No default
    const [amount, setAmount] = useState(''); // No default
    const [customAmount, setCustomAmount] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        pan: ''
    });

    useEffect(() => {
        // 1. Fetch User Details
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        if (adminInfo) {
            setFormData({
                name: (adminInfo.name + ' ' + adminInfo.surname).trim() || '',
                email: adminInfo.email || '',
                phone: adminInfo.mobileNumber || '',
                pan: ''
            });
        }
    }, []);

    const handleAmountClick = (value) => {
        setAmount(value);
        setCustomAmount(''); // Clear custom amount when preset is clicked
    };

    const handleCustomAmountChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setCustomAmount(val);
        if (val) setAmount(val);
    };

    return (
        <div className="w-full space-y-8 pb-12">
            {/* Back Button */}
            <div className="">
                <Link to="/dashboard/donations" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to My Donations
                </Link>
            </div>
            {/* Page Header - Keeping existing code... */}
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-[#1e2a4a]">Support Our Community</h1>
                <p className="text-gray-500 mt-2 max-w-2xl">
                    Your contributions act as a lifeline for underprivileged students and families.
                    Every rupee goes directly towards education, healthcare, and legal aid.
                </p>

                {/* Trust Stats Bar */}
                <div className="mt-6 inline-flex flex-wrap gap-6 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Total Raised: <strong className="text-gray-900">₹45,00,000</strong></span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Lives Impacted: <strong className="text-gray-900">350+</strong></span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                        <span className="text-gray-600">Active Donors: <strong className="text-gray-900">120</strong></span>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Donation Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Donation Type Toggle */}
                    <div className="bg-gray-100 p-1 rounded-xl inline-flex w-full md:w-auto">
                        <button
                            onClick={() => setDonationType('one-time')}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-lg text-sm font-bold transition-all ${donationType === 'one-time' ? 'bg-white text-[#1e2a4a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            One-time Donation
                        </button>
                        <button
                            onClick={() => setDonationType('sponsor')}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${donationType === 'sponsor' ? 'bg-white text-[#1e2a4a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Sponsor a Student
                            {donationType !== 'sponsor' && <span className="bg-[#f59e0b] text-white text-[10px] px-1.5 py-0.5 rounded ml-1">New</span>}
                        </button>
                    </div>

                    {donationType === 'sponsor' ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            {/* Existing Sponsor Code - Keeping it simple by not replacing the whole block if possible, but I am replacing the whole Main Component start... */}
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Featured Students Requiring Support</h2>
                            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                                Sponsorship feature is coming soon.
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Choose Cause */}
                            {/* Step 1: Choose Cause */}
                            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    1. Choose Contribution Purpose
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PurposeCard
                                        icon={FaGraduationCap}
                                        title="Education"
                                        description="Scholarships, books, and uniforms for students."
                                        selected={purpose === 'Education'}
                                        onClick={() => setPurpose('Education')}
                                    />
                                    <PurposeCard
                                        icon={FaHeartbeat}
                                        title="Health"
                                        description="Medical camps, surgeries, and emergency support."
                                        selected={purpose === 'Health'}
                                        onClick={() => setPurpose('Health')}
                                    />
                                    <PurposeCard
                                        icon={FaBalanceScale}
                                        title="Legal Aid"
                                        description="Pro-bono legal support for the marginalized."
                                        selected={purpose === 'Legal Aid'}
                                        onClick={() => setPurpose('Legal Aid')}
                                    />
                                    <PurposeCard
                                        icon={FaBriefcase}
                                        title="Employment"
                                        description="Skill development and job placement initiatives."
                                        selected={purpose === 'Employment'}
                                        onClick={() => setPurpose('Employment')}
                                    />
                                    <PurposeCard
                                        icon={FaHandHoldingHeart}
                                        title="Welfare"
                                        description="Community support, food security, and shelter."
                                        selected={purpose === 'Welfare'}
                                        onClick={() => setPurpose('Welfare')}
                                    />
                                </div>
                            </section>

                            {/* Step 2: Select Amount */}
                            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f59e0b]"></div>
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    2. Select Amount
                                </h2>

                                <div className="flex flex-wrap gap-4 mb-6">
                                    <AmountButton amount="500" value="500" selected={amount === '500' && !customAmount} onClick={handleAmountClick} />
                                    <AmountButton amount="1,100" value="1100" selected={amount === '1100' && !customAmount} onClick={handleAmountClick} />
                                    <AmountButton amount="5,100" value="5100" selected={amount === '5100' && !customAmount} onClick={handleAmountClick} />
                                    <AmountButton amount="21,000" value="21000" selected={amount === '21000' && !customAmount} onClick={handleAmountClick} />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold text-lg">₹</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        placeholder="Enter custom amount"
                                        className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-0 transition-colors
                                ${customAmount ? 'border-primary bg-blue-50/10' : 'border-gray-200 focus:border-primary'}`}
                                    />
                                    {customAmount && (
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-semibold text-gray-400">INR</span>
                                        </div>
                                    )}
                                </div>

                                {/* Impact Preview */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex gap-3 text-sm text-gray-600 border border-gray-100">
                                    <FaHandHoldingHeart className="text-primary mt-0.5" />
                                    <p>
                                        Your contribution of <strong>₹{amount || '0'}</strong> could help provide
                                        <strong className="text-primary"> {Math.floor(parseInt(amount || 0) / 500) || 0} students</strong> with essential books for a semester.
                                    </p>
                                </div>
                            </section>

                            {/* Step 3: Donor Details */}
                            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    3. Donor Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 flex justify-between">
                                            PAN Number <span className="text-gray-400 font-normal">Optional (For 80G Receipt)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.pan}
                                            onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                                            placeholder="Enter PAN"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAnonymous ? 'bg-primary border-primary text-white' : 'bg-white border-gray-400'}`}>
                                        {isAnonymous && <FaCheckCircle size={12} />}
                                    </div>
                                    <label className="text-sm text-gray-700 font-semibold cursor-pointer">Make this donation anonymous</label>
                                    <FaUserSecret className="text-gray-400 ml-auto" />
                                </div>
                            </section>

                            {/* Submit Button */}
                            <button
                                onClick={() => {
                                    if (!amount) {
                                        alert("Please select or enter a donation amount.");
                                        return;
                                    }

                                    navigate('/dashboard/donate/checkout', {
                                        state: { amount, purpose, donorDetails: formData }
                                    });
                                }}
                                className="w-full bg-[#1e2a4a] text-white text-xl font-bold py-5 rounded-2xl shadow-xl hover:bg-[#2a3b66] hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                                Proceed to Pay ₹{amount}
                                <FaCreditCard className="opacity-70" />
                            </button>

                            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                <FaLock size={10} />
                                Your transaction is secured by 256-bit SSL encryption.
                            </p>
                        </>
                    )}

                </div>



                {/* Right Column: Information & Trust */}
                {
                    donationType !== 'sponsor' && (
                        <div className="space-y-6 lg:sticky lg:top-8">

                            {/* Tax Benefits */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6 rounded-2xl">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                        <span className="font-black text-lg">%</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-900 text-lg">Tax Exemption</h3>
                                        <p className="text-sm text-green-800 mt-1 leading-relaxed">
                                            Donations above ₹500 are eligible for 50% tax exemption under Section 80G of the Income Tax Act.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-green-200/60 flex items-center gap-2 text-xs font-bold text-green-700">
                                    <FaCheckCircle /> You will receive an instant 80G receipt
                                </div>
                            </div>

                            {/* How It Helps */}
                            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <FaInfoCircle size={14} />
                                    </div>
                                    <h3 className="font-bold text-gray-800">Transparency Promise</h3>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    We pride ourselves on financial transparency. Here is how every ₹100 is utilized:
                                </p>
                                <div className="space-y-3 text-xs font-medium text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <span className="w-12 font-bold text-gray-800">85%</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-green-500 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-500">Program Costs</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-12 font-bold text-gray-800">10%</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="w-[10%] h-full bg-blue-500 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-500">Admin</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-12 font-bold text-gray-800">5%</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="w-[5%] h-full bg-orange-500 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-500">Fundraising</span>
                                    </div>
                                </div>
                            </div>

                            {/* Support Card */}
                            <div className="bg-[#1e2a4a] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h3 className="font-bold text-lg mb-2 relative z-10">Corporate Giving?</h3>
                                <p className="text-sm text-gray-300 mb-4 relative z-10">
                                    We partner with organizations for CSR initiatives. Contact our team for customized impact programs.
                                </p>
                                <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-bold transition relative z-10">
                                    Contact CSR Team
                                </button>
                            </div>

                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default Donate;
