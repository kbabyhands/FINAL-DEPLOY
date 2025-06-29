
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const { user, loading, initialized } = useAuth();

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <AdminDashboard />;
};

export default Admin;
