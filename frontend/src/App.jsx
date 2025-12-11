import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLandingPage from './pages/UserLandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import MyApplications from './pages/MyApplications';
import DashboardHome from './pages/DashboardHome';
import KYCVerification from './pages/KYCVerification';
import JobsEvents from './pages/JobsEvents';
import EventDetail from './pages/EventDetail';
import ApplicationDetail from './pages/ApplicationDetail';
import Donate from './pages/Donate';
import ProfileSettings from './pages/ProfileSettings';
import HealthAssistance from './pages/HealthAssistance';
import LegalAid from './pages/LegalAid';

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/" element={<UserLandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<div className="p-10 text-center">About Page Coming Soon</div>} />
                <Route path="/benefits" element={<div className="p-10 text-center">Benefits Page Coming Soon</div>} />
                <Route path="/donate" element={<div className="p-10 text-center">Donate Page Coming Soon</div>} />

                {/* Dashboard Area */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="applications" element={<MyApplications />} />
                    <Route path="kyc" element={<KYCVerification />} />
                    <Route path="jobs" element={<JobsEvents />} />
                    <Route path="jobs/:id" element={<EventDetail />} />
                    <Route path="applications/:id" element={<ApplicationDetail />} />
                    <Route path="donate" element={<Donate />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="health" element={<HealthAssistance />} />
                    <Route path="legal" element={<LegalAid />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
