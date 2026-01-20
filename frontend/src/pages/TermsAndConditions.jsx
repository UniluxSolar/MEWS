import React from 'react';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <FaFileContract size={24} className="text-blue-100" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Mala Educational Welfare Society</h1>
                            <p className="text-xs text-blue-200 mt-0.5">Terms & Conditions</p>
                        </div>
                    </div>
                    {/* Optional: Close / Back button if opened in same tab, though usually opened in new tab */}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h2>
                    <p className="text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">1. Introduction</h3>
                            <p>
                                Welcome to the Mala Educational Welfare Society (MEWS). By registering as a member, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">2. Membership Eligibility</h3>
                            <p>
                                Membership is open to individuals who meet the criteria set forth by the society's bylaws. Applicants must provide accurate, current, and complete information during the registration process.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">3. Code of Conduct</h3>
                            <p>
                                Members are expected to conduct themselves in a manner that upholds the dignity and mission of the society. Any behavior deemed detrimental to the society's interests may result in termination of membership.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">4. Privacy Policy</h3>
                            <p>
                                We value your privacy. Your personal information will be used strictly for administrative purposes and to provide you with society benefits. We do not sell or share your data with unauthorized third parties.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">5. Membership Fees</h3>
                            <p>
                                Members may be required to pay membership fees as determined by the governing body. All fees are non-refundable unless otherwise stated.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">6. Termination</h3>
                            <p>
                                MEWS reserves the right to terminate membership for violation of these terms, non-payment of dues, or conduct harmful to the organization.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-blue-900 mb-3">7. Amendments</h3>
                            <p>
                                The society reserves the right to modify these terms at any time. Members will be notified of significant changes.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-gray-100 mt-8">
                            <p className="text-sm text-gray-500 italic">
                                By proceeding with your registration, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Mala Educational Welfare Society. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default TermsAndConditions;
