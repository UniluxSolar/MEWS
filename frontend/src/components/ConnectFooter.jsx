import MewsLogo from '../assets/mews_main_logo_new.png';

const ConnectFooter = () => {
    return (
        <footer className="bg-[#1e2a4a] text-white py-12 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden">
                        <img src={MewsLogo} alt="MEWS" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold leading-none tracking-tight">MEWS CONNECT</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Mala Educational Welfare Society</span>
                    </div>
                </div>

                <div className="text-xs text-gray-400 text-center md:text-right">
                    <p>&copy; 2024 MEWS. All rights reserved.</p>
                    <p className="mt-1">A Community-Led Initiative | Developed with ❤️ for the Mala Community</p>
                </div>
            </div>
        </footer>
    );
};

export default ConnectFooter;
