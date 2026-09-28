import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { MobileBottomNav } from './components/MobileBottomNav';

import { LandingPage } from './pages/LandingPage';
import { BookingPage } from './pages/BookingPage';
import { MentorDashboard } from './pages/MentorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DemoClassroom } from './pages/DemoClassroom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

import { ScrollToTop } from './components/ScrollToTop';
import { BackgroundEffects } from './components/BackgroundEffects';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white pb-16 md:pb-0 pt-16 relative">
            <BackgroundEffects />
            <Navbar />
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/mentor" element={<MentorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/class/:bookingReference" element={<DemoClassroom />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Routes>
            </main>
            <div className="relative z-10">
              <Footer />
            </div>
            <ChatbotWidget />
            <MobileBottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
