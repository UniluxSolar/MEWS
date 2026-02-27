import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLandingPage from './pages/UserLandingPage';
import LoginPage from './pages/LoginPage';
import InstitutionLoginPage from './pages/InstitutionLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DistrictDashboard from './pages/DistrictDashboard';
import MandalDashboard from './pages/MandalDashboard';
import VillageDashboard from './pages/VillageDashboard';
import MunicipalityDashboard from './pages/MunicipalityDashboard';
import AssignAdmin from './pages/AssignAdmin';
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
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import FundingRequests from './pages/FundingRequests';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminActivityLog from './pages/AdminActivityLog';
import AdminVillageSettings from './pages/AdminVillageSettings';
import CarouselManagement from './pages/CarouselManagement';
import AdminHelpSupport from './pages/AdminHelpSupport';
import DashboardLayout from './layouts/DashboardLayout';
import MyApplications from './pages/MyApplications';
import DashboardHome from './pages/DashboardHome';
import MEWSServices from './pages/MEWSServices';

import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import Helpdesk from './pages/Helpdesk';
import HelpSupport from './pages/HelpSupport';
import JobsEvents from './pages/JobsEvents';
import EventDetail from './pages/EventDetail';
import ApplicationDetails from './pages/ApplicationDetails';
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
import CampaignDetails from './pages/CampaignDetails';
import MemberApplicationView from './pages/MemberApplicationView';
import MemberIDCardView from './pages/MemberIDCardView';

import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import SupportPage from './pages/SupportPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

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
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<UserLandingPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/institution/login" element={<InstitutionLoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN', 'MANDAL_ADMIN', 'DISTRICT_ADMIN', 'STATE_ADMIN']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    {/* Drill-Down Dashboard Routes */}
                    <Route path="/admin/dashboard/district/:id" element={<DistrictDashboard />} />
                    <Route path="/admin/dashboard/mandal/:id" element={<MandalDashboard />} />
                    <Route path="/admin/dashboard/municipality/:id" element={<MunicipalityDashboard />} />
                    <Route path="/admin/dashboard/village/:id" element={<VillageDashboard />} />

                    <Route path="/admin/assign-admin" element={<AssignAdmin />} />
                    <Route path="/admin/management" element={<AdminManagement />} />
                    <Route path="/admin/members" element={<MemberManagement />} />
                    <Route path="/admin/members/new" element={<MemberRegistration />} />
                    <Route path="/admin/members/generate-id" element={<GenerateIDCard />} />
                    <Route path="/admin/institutions" element={<InstitutionManagement />} />
                    <Route path="/admin/institutions/new" element={<InstitutionRegistration />} />
                    <Route path="/admin/institutions/:id" element={<InstitutionDetail />} />
                    <Route path="/admin/institutions/edit/:id" element={<EditInstitution />} />

                    <Route path="/admin/funding" element={<FundingRequests />} />
                    <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                    <Route path="/admin/activity-log" element={<AdminActivityLog />} />
                    <Route path="/admin/settings" element={<AdminVillageSettings />} />
                    <Route path="/admin/help" element={<AdminHelpSupport />} />
                    <Route path="/admin/notifications" element={<AdminNotifications />} />
                    <Route path="/admin/carousel" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><CarouselManagement /></ProtectedRoute>} />
                    <Route path="/admin/members/:id" element={<MemberRegistration />} />
                    <Route path="/admin/members/edit/:id" element={<MemberRegistration />} />
                </Route>

                <Route path="/benefits" element={<div className="p-10 text-center">Benefits Page Coming Soon</div>} />
                <Route path="/donate" element={<div className="p-10 text-center">Donate Page Coming Soon</div>} />


                {/* Dashboard Area - Protected (Member & Institution & Admins) */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['MEMBER', 'INSTITUTION', 'SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'ADMIN']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="applications" element={<MyApplications />} />
                        <Route path="applications/new" element={<NewApplication />} />
                        <Route path="services" element={<MEWSServices />} />

                        <Route path="jobs" element={<JobsEvents />} />
                        <Route path="jobs/:id" element={<EventDetail />} />
                        <Route path="applications/:id" element={<ApplicationDetails />} />
                        <Route path="donate" element={<Donate />} />
                        <Route path="profile" element={<ProfileSettings />} />
                        <Route path="member/application/:id" element={<MemberApplicationView />} />
                        <Route path="member/id-card/:id" element={<MemberIDCardView />} />
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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
