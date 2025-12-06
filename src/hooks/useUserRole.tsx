
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type UserRole = 'admin' | 'moderator' | 'user' | 'therapist' | 'parent' | 'therapist_admin' | 'parent_admin';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setError(error.message);
          setRole(null);
        } else if (!data) {
          // No role found, default to 'parent' (since we're migrating from 'user')
          setRole('parent');
        } else {
          setRole(data.role as UserRole);
        }
      } catch (err) {
        setError('Failed to fetch user role');
        console.error('Error fetching user role:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  const hasRole = (requiredRole: UserRole) => {
    if (!role) return false;
    
    const roleHierarchy = { 'user': 0, 'parent': 0, 'moderator': 1, 'therapist': 1, 'admin': 2, 'therapist_admin': 2, 'parent_admin': 2 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = () => {
    if (!role) return false;
    return role === 'admin' || role === 'therapist_admin' || role === 'parent_admin';
  };

  const isTherapist = () => {
    if (!role) return false;
    return role === 'therapist' || role === 'therapist_admin';
  };

  const isParent = () => {
    if (!role) return false;
    return role === 'parent' || role === 'parent_admin' || role === 'user';
  };

  return { role, loading, error, hasRole, isAdmin, isTherapist, isParent };
};
