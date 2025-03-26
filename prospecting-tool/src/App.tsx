// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from './pages/login';
import DashboardHomePage from './pages/DashboardHomePage';
import ProspectingPage from './pages/ProspectingPage';
import AdminPage from './pages/AdminPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import WidgetsPage from './pages/WidgetsPage';
import LeadDashboardPage from './pages/LeadDashboardPage';
import PricingPage from './pages/PricingPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import AccountSubscriptionPage from './pages/AccountSubscriptionPage';
import CancelSubscriptionPage from './pages/CancelSubscriptionPage';
import ChatDashboardPage from './pages/ChatDashboardPage';
import TeamPage from './pages/TeamPage';
import InvitationPage from './pages/InvitationPage';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SupportChat } from '@/components/support/SupportChat';
import { useEffect as useEffectOnce, useState as useStateOnce } from 'react';
import { isAdminAvailable } from '@/services/support';

// Layout component for authenticated pages with sidebar
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [adminAvailable, setAdminAvailable] = useStateOnce(false);
  
  // Check if admin is available for support chat
  useEffectOnce(() => {
    const checkAdminAvailability = async () => {
      try {
        const available = await isAdminAvailable();
        setAdminAvailable(available);
      } catch (error) {
        console.error("Error checking admin availability:", error);
      }
    };
    
    checkAdminAvailability();
  }, []);
  
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset className="w-full">
          {children}
        </SidebarInset>
        
        {/* Support Chat */}
        <SupportChat adminAvailable={adminAvailable} />
      </div>
    </SidebarProvider>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure dark mode is applied
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#09090b';
    document.body.style.color = '#f0f0f1';
    
    // Make body visible after ensuring dark mode is applied
    document.body.style.visibility = 'visible';
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? 
          <AuthenticatedLayout>
            <DashboardHomePage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/prospecting" element={user ? 
          <AuthenticatedLayout>
            <ProspectingPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/admin" element={user ? 
          <AuthenticatedLayout>
            <AdminPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/admin/settings" element={user ? 
          <AuthenticatedLayout>
            <AdminSettingsPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/intelligence" element={user ? 
          <AuthenticatedLayout>
            <WidgetsPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/leads" element={user ? 
          <AuthenticatedLayout>
            <LeadDashboardPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/pricing" element={
          <AuthenticatedLayout>
            <PricingPage />
          </AuthenticatedLayout>
        } />
        <Route path="/checkout" element={user ? 
          <AuthenticatedLayout>
            <CheckoutPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/checkout/success" element={user ? 
          <AuthenticatedLayout>
            <CheckoutSuccessPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/account/subscription" element={user ? 
          <AuthenticatedLayout>
            <AccountSubscriptionPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/account/cancel-subscription" element={user ? 
          <AuthenticatedLayout>
            <CancelSubscriptionPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/chat" element={user ? 
          <AuthenticatedLayout>
            <ChatDashboardPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/team" element={user ? 
          <AuthenticatedLayout>
            <TeamPage />
          </AuthenticatedLayout> 
          : <Navigate to="/login" />} 
        />
        <Route path="/invitation/:token" element={
          <InvitationPage />
        } />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
