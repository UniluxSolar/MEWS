import React from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectHero from '../components/ConnectHero';
import ImpactDashboard from '../components/ImpactDashboard';
import StatsSummary from '../components/StatsSummary';
import Campaigns from '../components/Campaigns';
import ConnectFooter from '../components/ConnectFooter';

const UserLandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <ConnectNavbar />
            <main>
                <ConnectHero />
                <ImpactDashboard />
                <StatsSummary />
                <Campaigns />
            </main>
            <ConnectFooter />
        </div>
    );
};

export default UserLandingPage;
