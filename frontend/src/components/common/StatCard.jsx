import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color, onClick }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl ${color}`}></div>
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={24} className={`text-${color.split('-')[1]}-600`} />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                {subtext && <p className="text-xs mt-2 text-slate-400 font-medium">{subtext}</p>}
            </div>
        </div>
    </div>
);

export default StatCard;
