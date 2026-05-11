import { useState, useEffect } from 'react';
import AdminLogin     from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import JoinRoom       from '@/components/user/JoinRoom';
import ChatRoom       from '@/components/chat/ChatRoom';
import { adminService } from '@/services/api';
import {
  ToastProvider, ToastViewport, Toast,
  ToastTitle, ToastDescription, ToastClose
} from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';

// Enrutador simple basado en pathname
function getRoute() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return 'admin';
  return 'user';
}

function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} open={t.open} variant={t.variant}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export default function App() {
  const route = getRoute();

  // ── Estado Admin ──────────────────────────────────────
  const [adminLogged, setAdminLogged] = useState(adminService.isAuthenticated());

  // ── Estado Usuario ────────────────────────────────────
  const [sesion, setSesion] = useState(() => {
    const saved = sessionStorage.getItem('sesion');
    return saved ? JSON.parse(saved) : null;
  });

  const handleJoined = (data) => {
    sessionStorage.setItem('sesion', JSON.stringify(data));
    setSesion(data);
  };

  const handleLeave = () => {
    sessionStorage.removeItem('sesion');
    setSesion(null);
  };

  // ── Vista Admin ───────────────────────────────────────
  if (route === 'admin') {
    if (!adminLogged) return <AdminLogin onLogin={() => setAdminLogged(true)} />;
    return <AdminDashboard onLogout={() => setAdminLogged(false)} />;
  }

  // ── Vista Usuario ─────────────────────────────────────
  if (sesion) return <ChatRoom sesion={sesion} onLeave={handleLeave} />;
  return (
    <>
      <JoinRoom onJoined={handleJoined} />
      <Toaster />
    </>
  );
}