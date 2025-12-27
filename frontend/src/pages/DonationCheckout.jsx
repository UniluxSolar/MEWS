import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    FaShieldAlt, FaRupeeSign, FaCreditCard, FaUniversity, FaWallet,
    FaCheckCircle, FaLock, FaPhoneAlt, FaEnvelope, FaEdit, FaFileInvoiceDollar, FaGraduationCap, FaChevronLeft
} from 'react-icons/fa';

// Payment Method Option Component
const PaymentMethod = ({ id, icon: Icon, title, subtext, selected, onSelect }) => (
    <div
        onClick={() => onSelect(id)}
        className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all
        ${selected
                ? 'border-primary bg-blue-50/50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
    >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
            ${selected ? 'border-primary' : 'border-gray-300'}`}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${selected ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500'}`}>
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
    </div>
);

const DonationCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Default values if navigated directly without state (for development/testing)
    const { amount = '5100', purpose = 'Education Scholarships', donorDetails = {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91 98765 43210',
        pan: ''
    } } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [pan, setPan] = useState(donorDetails.pan || '');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Calculate tax deduction (Simplified for demo)
    const taxDeduction = Math.floor(parseInt(amount.replace(/,/g, '')) * 0.5);

    const handlePay = () => {
        if (!termsAccepted) {
            alert("Please accept the Terms and Conditions.");
            return;
        }

        // Simulate payment processing
        setTimeout(() => {
            navigate('/dashboard/donate/success', {
                state: {
                    amount,
                    purpose,
                    transactionId: 'TXN' + Date.now(),
                    date: new Date().toLocaleString(),
                    paymentMethod: paymentMethod
                }
            });
        }, 1500); // Simulate delay
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Header */}
            <div>
                <Link to="/dashboard/donate" className="flex items-center gap-2 text-gray-500 hover:text-[#1e2a4a] text-sm font-bold mb-2 transition">
                    <FaChevronLeft size={10} /> Back to Donate
                </Link>
                <h1 className="text-3xl font-bold text-[#1e2a4a]">Complete Your Donation</h1>
                <p className="text-gray-500 mt-1">Review your donation details and complete payment securely.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Checkout Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Donation Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Donation Summary</h2>

                        <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between mb-4 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <FaGraduationCap size={18} />
                                    {/* Note: Icon usage placeholder, importing simplistic icon for now */}
                                    <FaFileInvoiceDollar size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{purpose}</h3>
                                    <p className="text-xs text-gray-500">One-time donation</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">₹{amount}</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Donation Amount</span>
                                <span>₹{amount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Platform Fee</span>
                                <span>₹0</span>
                            </div>
                            <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between text-lg font-bold text-[#1e2a4a]">
                                <span>Total Amount</span>
                                <span>₹{amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Select Payment Method</h2>
                        <div className="space-y-3">
                            <PaymentMethod
                                id="upi"
                                icon={FaWallet}
                                title="UPI"
                                subtext="Pay using any UPI app (GPay, PhonePe, Paytm)"
                                selected={paymentMethod === 'upi'}
                                onSelect={setPaymentMethod}
                            />
                            <PaymentMethod
                                id="card"
                                icon={FaCreditCard}
                                title="Debit/Credit Card"
                                subtext="Visa, Mastercard, RuPay"
                                selected={paymentMethod === 'card'}
                                onSelect={setPaymentMethod}
                            />
                            <PaymentMethod
                                id="netbanking"
                                icon={FaUniversity}
                                title="Net Banking"
                                subtext="All major banks supported"
                                selected={paymentMethod === 'netbanking'}
                                onSelect={setPaymentMethod}
                            />
                        </div>
                    </div>

                    {/* Tax Receipt */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFileInvoiceDollar className="text-green-600" />
                            <h2 className="text-lg font-bold text-gray-800">Tax Receipt & Benefits</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Add your PAN number to receive tax benefits under Section 80G.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">PAN Number</label>
                                <input
                                    type="text"
                                    value={pan}
                                    onChange={(e) => setPan(e.target.value)}
                                    placeholder="Enter PAN (e.g., ABCDE1234F)"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Tax Deduction Available</label>
                                <div className="w-full px-4 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 font-bold">
                                    ₹{taxDeduction.toLocaleString()} (50% of donation)
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <FaCheckCircle size={10} />
                            80G certificate will be emailed instantly after payment
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Terms & Conditions</h2>
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-600">
                                    I agree to the <a href="#" className="text-secondary hover:underline">Terms and Conditions</a> and <a href="#" className="text-secondary hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                                <span className="text-sm text-gray-600">
                                    I would like to receive updates about how my donation is being used.
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Pay Button (Mobile/Desktop Bottom) */}
                    <button
                        onClick={handlePay}
                        className="w-full bg-[#1e2a4a] text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:bg-[#2a3b66] hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        <FaShieldAlt className="opacity-70" />
                        Pay ₹{amount} Securely
                    </button>

                    <div className="flex justify-center items-center gap-6 text-xs text-gray-400">
                        <span>Secured by Razorpay</span>
                        <span className="flex items-center gap-1"><FaLock size={8} /> 256-bit SSL</span>
                        <span className="flex items-center gap-1"><FaCreditCard size={8} /> PCI DSS</span>
                    </div>

                </div>

                {/* Right Column: Donor Info & Trust */}
                <div className="space-y-6">

                    {/* Donor Information Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Donor Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Name</p>
                                <p className="text-sm font-semibold text-gray-900">{donorDetails.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{donorDetails.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Mobile</p>
                                <p className="text-sm font-semibold text-gray-900">{donorDetails.phone}</p>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline mt-2"
                            >
                                <FaEdit /> Edit Details
                            </button>
                        </div>
                    </div>

                    {/* Secure Payment Badge */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <FaShieldAlt className="text-blue-500" size={20} />
                            <h3 className="font-bold text-gray-800">Secure Payment</h3>
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" size={12} />
                                Your payment is protected by 256-bit SSL encryption.
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" size={12} />
                                We don't store your card details.
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" size={12} />
                                PCI DSS compliant payment gateway.
                            </li>
                        </ul>
                    </div>

                    {/* Help Box */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-2">Need Help?</h3>
                        <p className="text-xs text-gray-500 mb-4">Having trouble with payment? Contact our support team.</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaPhoneAlt className="text-gray-400" size={14} />
                                <span className="font-medium">+91 1800-123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaEnvelope className="text-gray-400" size={14} />
                                <span className="font-medium">support@mews.gov.in</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            24/7 Support Available
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DonationCheckout;
