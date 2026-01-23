import React from 'react';
import { FaBullhorn, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ title, subtitle, stats, breadcrumb, headerActions, children }) => {
    return (
        <div className="bg-gradient-to-r from-[#1e2a4a] to-[#2a3b66] text-white p-8 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
                <div className="w-full md:w-auto">
                    <p className="text-white text-sm font-medium mb-1 uppercase tracking-wider opacity-80">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {breadcrumb && (
                        <div className="text-blue-200 text-sm font-medium mb-2 flex items-center gap-1">
                            {breadcrumb}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-3xl font-bold text-white whitespace-nowrap">
                            {title}
                        </h1>
                        {headerActions && (
                            <div className="flex items-center gap-3">
                                {headerActions}
                            </div>
                        )}
                    </div>
                    {subtitle && (
                        <div className="text-white mt-2 opacity-90 max-w-xl text-sm">
                            {subtitle}
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    {children ? children : (
                        <>
                            <Link to="/admin/announcements" className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/20">
                                <FaBullhorn /> Broadcast
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
