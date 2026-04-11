import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const DELIVERY_KEY = 'nnkb_delivery_locked';

interface Props { children: React.ReactNode; }

export const DeliveryProtectedRoute: React.FC<Props> = ({ children }) => {
  const { replace } = useNavigation();
  const [status, setStatus] = useState<'checking'|'allowed'|'denied'>('checking');

  useEffect(() => {
    const stored = localStorage.getItem(DELIVERY_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data?.id) { setStatus('allowed'); return; }
      } catch(e) {}
    }
    setStatus('denied');
  }, []);

  if (status === 'checking') return (
    <div className="fixed inset-0 bg-[#080e1a] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-orange-400" />
    </div>
  );

  if (status === 'denied') {
    replace('/delivery-login');
    return null;
  }

  return <>{children}</>;
};
