'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/types';
import { setCurrentUserRole as setRoleInAuth } from '@/lib/auth';

interface UserRoleSwitcherProps {
  currentRole: UserRole;
}

export function UserRoleSwitcher({ currentRole }: UserRoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const router = useRouter();

  // Sync with localStorage on client mount
  useEffect(() => {
    const storedRole = localStorage.getItem('currentUserRole') as UserRole | null;
    if (storedRole) {
      setSelectedRole(storedRole);
    }
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setRoleInAuth(newRole); // Update auth mock
    localStorage.setItem('currentUserRole', newRole); // Persist for demo
    router.refresh(); // Re-fetch server components with new role
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="role-switcher" className="text-sm font-medium text-muted-foreground hidden md:inline">
        View as:
      </Label>
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger id="role-switcher" className="w-[120px] h-9">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="teacher">Teacher</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
