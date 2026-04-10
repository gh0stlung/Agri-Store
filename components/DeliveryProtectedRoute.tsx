import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';

interface DeliveryProtectedRouteProps {
  children: React.ReactNode;
}

export const DeliveryProtectedRoute: React.FC<DeliveryProtectedRouteProps> = ({ children }) => {
  const { push } = useNavigation();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('delivery_staff');
    if (!stored) {
      push('/delivery-login');
    } else {
      setAllowed(true);
    }
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!allowed) return null;
  return <>{children}</>;
};
