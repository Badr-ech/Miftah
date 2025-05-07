'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/types';
import { login as performLogin } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ShieldCheck, User, Users } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await performLogin(selectedRole);
      toast({
        title: 'Login Successful',
        description: `You are now logged in as a ${selectedRole}.`,
        variant: 'default',
      });
      router.push('/dashboard');
      router.refresh(); // Important to re-fetch layout and user data
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
       <div className="absolute inset-0 -z-10">
        <Image 
          src="https://picsum.photos/seed/login-bg/1920/1080" 
          alt="Abstract background" 
          layout="fill" 
          objectFit="cover"
          data-ai-hint="abstract background"
          className="opacity-20"
        />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4 p-3 bg-primary/10 rounded-full">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Miftah</CardTitle>
          <CardDescription>Please select your role to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedRole}
              onValueChange={(value: UserRole) => setSelectedRole(value)}
              className="grid grid-cols-1 gap-4"
            >
              <Label
                htmlFor="student"
                className={`flex items-center space-x-3 rounded-md border-2 p-4 transition-all hover:border-primary ${selectedRole === 'student' ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'}`}
              >
                <RadioGroupItem value="student" id="student" />
                <User className="h-6 w-6 text-primary" />
                <span className="font-medium">Student</span>
              </Label>
              <Label
                htmlFor="teacher"
                className={`flex items-center space-x-3 rounded-md border-2 p-4 transition-all hover:border-primary ${selectedRole === 'teacher' ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'}`}
              >
                <RadioGroupItem value="teacher" id="teacher" />
                <Users className="h-6 w-6 text-primary" />
                <span className="font-medium">Teacher</span>
              </Label>
              <Label
                htmlFor="admin"
                className={`flex items-center space-x-3 rounded-md border-2 p-4 transition-all hover:border-primary ${selectedRole === 'admin' ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'}`}
              >
                <RadioGroupItem value="admin" id="admin" />
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="font-medium">Admin</span>
              </Label>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
