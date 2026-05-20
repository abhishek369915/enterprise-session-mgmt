import { useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useSession } from '@/hooks/useSession';
import { AuthService } from '@/services/AuthService';

export function DashboardPage() {
  const { startSession } = useSession();

  useEffect(() => {
    // Re-hydrate session if the user refreshed the browser
    if (AuthService.isAuthenticated()) {
      startSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <DashboardLayout />;
}
