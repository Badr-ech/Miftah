'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout as performLogout } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      await performLogout(); // This is now async
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // Redirect to login page or home page
      router.push('/login');
      router.refresh(); // Force a refresh to ensure state is cleared
    };

    handleLogout();
  }, [router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Logging Out</h1>
      <p className="text-muted-foreground">Please wait while we securely log you out...</p>
    </div>
  );
}
