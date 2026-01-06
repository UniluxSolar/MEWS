import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLandingPage from './pages/UserLandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import MemberManagement from './pages/MemberManagement';
import MemberRegistration from './pages/MemberRegistration';
import MemberProfile from './pages/MemberProfile';
import EditMember from './pages/EditMember';
import GenerateIDCard from './pages/GenerateIDCard';
import InstitutionManagement from './pages/InstitutionManagement';
import InstitutionRegistration from './pages/InstitutionRegistration';
import InstitutionDetail from './pages/InstitutionDetail';
import EditInstitution from './pages/EditInstitution';

import FundingRequests from './pages/FundingRequests';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminActivityLog from './pages/AdminActivityLog';
import AdminVillageSettings from './pages/AdminVillageSettings';
import AdminHelpSupport from './pages/AdminHelpSupport';
import DashboardLayout from './layouts/DashboardLayout';
import MyApplications from './pages/MyApplications';
import DashboardHome from './pages/DashboardHome';
import KYCVerification from './pages/KYCVerification';
import KYCSuccess from './pages/KYCSuccess';
import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import Helpdesk from './pages/Helpdesk';
import HelpSupport from './pages/HelpSupport';
import JobsEvents from './pages/JobsEvents';
import EventDetail from './pages/EventDetail';
import ApplicationDetail from './pages/ApplicationDetail';
import Donate from './pages/Donate';
import ProfileSettings from './pages/ProfileSettings';
import HealthAssistance from './pages/HealthAssistance';
import LegalAid from './pages/LegalAid';
import NewApplication from './pages/NewApplication';
import StudentProfile from './pages/StudentProfile';
import MyDonations from './pages/MyDonations';
import DonationCheckout from './pages/DonationCheckout';
import DonationSuccess from './pages/DonationSuccess';
import TermsAndConditions from './pages/TermsAndConditions';

const ThemeInitializer = () => {
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);
    return null;
};

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ThemeInitializer />
            <Routes>
                <Route path="/" element={<UserLandingPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/management" element={<AdminManagement />} />
                <Route path="/admin/members" element={<MemberManagement />} />
                <Route path="/admin/members/new" element={<MemberRegistration />} />
                <Route path="/admin/members/generate-id" element={<GenerateIDCard />} />
                <Route path="/admin/institutions" element={<InstitutionManagement />} />
                <Route path="/admin/institutions/new" element={<InstitutionRegistration />} />
                <Route path="/admin/institutions/:id" element={<InstitutionDetail />} />
                <Route path="/admin/institutions/edit/:id" element={<EditInstitution />} />

                <Route path="/admin/funding" element={<FundingRequests />} />
                <Route path="/admin/funding" element={<FundingRequests />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/activity-log" element={<AdminActivityLog />} />
                <Route path="/admin/settings" element={<AdminVillageSettings />} />
                <Route path="/admin/help" element={<AdminHelpSupport />} />
                <Route path="/admin/help" element={<AdminHelpSupport />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/members/:id" element={<MemberRegistration />} />
                <Route path="/admin/members/:id" element={<MemberRegistration />} />
                <Route path="/admin/members/edit/:id" element={<MemberRegistration />} />
                <Route path="/about" element={<div className="p-10 text-center">About Page Coming Soon</div>} />
                <Route path="/benefits" element={<div className="p-10 text-center">Benefits Page Coming Soon</div>} />
                <Route path="/donate" element={<div className="p-10 text-center">Donate Page Coming Soon</div>} />

                {/* Dashboard Area */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="applications" element={<MyApplications />} />
                    <Route path="applications/new" element={<NewApplication />} />
                    <Route path="kyc" element={<KYCVerification />} />
                    <Route path="kyc/success" element={<KYCSuccess />} />
                    <Route path="jobs" element={<JobsEvents />} />
                    <Route path="jobs/:id" element={<EventDetail />} />
                    <Route path="applications/:id" element={<ApplicationDetail />} />
                    <Route path="donate" element={<Donate />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="health" element={<HealthAssistance />} />
                    <Route path="legal" element={<LegalAid />} />
                    <Route path="sponsor/student/:id" element={<StudentProfile />} />
                    <Route path="donations" element={<MyDonations />} />
                    <Route path="donate/checkout" element={<DonationCheckout />} />
                    <Route path="donate/success" element={<DonationSuccess />} />
                    <Route path="helpdesk" element={<Helpdesk />} />
                    <Route path="support" element={<HelpSupport />} />
                    <Route path="notifications" element={<Notifications />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
