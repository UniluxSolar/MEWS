import React from 'react';
import { Link } from 'react-router-dom';

const ActionCard = ({ title, desc, icon: Icon, to, gradient }) => (
    <Link to={to || '#'} className={`relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block h-full group ${gradient}`}>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className="p-8 flex flex-col items-center text-center h-full justify-center relative z-10">
            <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300 text-white">
                <Icon size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{title}</h3>
            <p className="text-sm text-blue-100 opacity-90 font-medium">{desc}</p>
        </div>
    </Link>
);

export default ActionCard;
