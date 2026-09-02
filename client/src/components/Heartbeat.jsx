import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function getSessionId() {
  let id = localStorage.getItem('so_vid');
  if (!id) {
    id = 'vid_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('so_vid', id);
  }
  return id;
}

function sayfaAdi(path) {
  if (path === '/') return 'Anasayfa';
  if (path.startsWith('/admin')) return 'Admin Paneli';
  if (path.startsWith('/saticilar')) return 'Saticilar';
  return path || 'Anasayfa';
}

export function sendEvent(olay, ekstra = {}) {
  const vid = getSessionId();
  const sayfa = window.location.pathname;
  const ad = (() => {
    try {
      const userStr = localStorage.getItem('so_user');
      return userStr ? JSON.parse(userStr).ad || 'Misafir' : 'Misafir';
    } catch {
      return 'Misafir';
    }
  })();

  const payload = { id: vid, ad, sayfa, olay, ...ekstra };
  api.post('/analytics/heartbeat', payload).catch(() => {});
}

export default function Heartbeat() {
  const location = useLocation();
  const { user } = useAuth();
  const lastPath = useRef(null);

  useEffect(() => {
    const vid = getSessionId();

    if (user) {
      localStorage.setItem('so_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('so_user');
    }

    const ad = user ? user.ad : 'Misafir';
    const sayfa = sayfaAdi(location.pathname);

    if (lastPath.current !== null && lastPath.current !== location.pathname) {
      api.post('/analytics/heartbeat', { id: vid, ad, sayfa, olay: 'navigasyon', onceki: lastPath.current }).catch(() => {});
    }
    lastPath.current = location.pathname;

    api.post('/analytics/heartbeat', { id: vid, ad, sayfa, olay: 'goruntuleme' }).catch(() => {});

    const heartbeat = setInterval(() => {
      const currentAd = user ? user.ad : 'Misafir';
      api.post('/analytics/heartbeat', { id: vid, ad: currentAd, sayfa: sayfaAdi(window.location.pathname), olay: 'heartbeat' }).catch(() => {});
    }, 5000);

    const cleanup = () => {
      clearInterval(heartbeat);
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [user, location.pathname]);

  return null;
}