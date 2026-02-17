'use client';
import { Admin } from '../../pages/Admin';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  );
}