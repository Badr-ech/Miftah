'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import type { UserRole } from '../../types';
import { login as performLogin, loginWithRole } from '../../lib/auth';
import { useToast } from '../../hooks/use-toast';
import { BookOpen, ShieldCheck, User, Users, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'quick' | 'email'>('quick');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    // Generate a random image URL on client mount to avoid hydration mismatch
    setBgImage(`https://picsum.photos/seed/login-bg-${Math.random()}/1920/1080`);
  }, []);  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Check if there's a redirect destination in the URL
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get('from') || '/dashboard';
    
    try {
      if (loginMethod === 'quick') {
        // Use the legacy quick role selection login - this is now working for demo purposes
        console.log(`[LoginPage] Attempting quick login with role: ${selectedRole}`);
        const user = await loginWithRole(selectedRole);
        console.log(`[LoginPage] Quick login successful, user: ${user.name}, role: ${user.role}`);
        console.log(`[LoginPage] Redirecting to: ${redirectTo}`);
        
        toast({
          title: 'Quick Login Successful',
          description: `You are now logged in as a ${selectedRole}.`,
          variant: 'default',
        });
        
        // Add a small delay before redirecting to ensure toast shows and cookies are set
        setTimeout(() => {
          router.push(redirectTo);
        }, 500);
      } else {
        // Use the email/password login
        console.log(`[LoginPage] Attempting email login for: ${email}`);
        const user = await performLogin(email, password);
        console.log(`[LoginPage] Email login successful, user: ${user.name}, role: ${user.role}`);
        
        toast({
          title: 'Login Successful',
          description: `You are now logged in.`,
          variant: 'default',
        });
        
        // Add a small delay before redirecting to ensure toast shows and cookies are set
        setTimeout(() => {
          console.log(`[LoginPage] Redirecting to: ${redirectTo}`);
          router.push(redirectTo);
          router.refresh(); // Important to re-fetch layout and user data
        }, 500);
        
        return; // Skip the additional redirect below
      }
      
      // This code is unreachable as both branches above have returns or timeouts
    } 
    catch {
      // For demo purposes, let's try the quick login as a fallback
      if (loginMethod === 'email') {
        try {
          // Fallback to role-based login for the demo
          const fallbackRole = email.includes('admin') ? 'admin' : 
                              email.includes('teacher') ? 'teacher' : 'student';
          await loginWithRole(fallbackRole);
          toast({
            title: 'Demo Login',
            description: `Login successful with demo credentials as ${fallbackRole}.`,
          });          // Always redirect to the main dashboard regardless of role
          router.push('/dashboard');
          router.refresh();
          return;
        } catch (fallbackError) {
          console.error('Fallback login failed:', fallbackError);
        }
      }
        // For demo purposes, let's show a more descriptive message
      toast({
        title: 'Login Failed', 
        description: 'For this demo, please use the Quick Login option instead.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
       {bgImage && <div className="absolute inset-0 -z-10">
        <Image 
          src={bgImage}
          alt="Abstract background" 
          fill
          data-ai-hint="abstract background"
          className="opacity-20 object-cover"
          priority 
        />
      </div>}
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4 p-3 bg-primary/10 rounded-full">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Miftah</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="quick" onValueChange={(value) => setLoginMethod(value as 'quick' | 'email')}>
          <TabsList className="grid grid-cols-2 w-[80%] mx-auto mb-4">
            <TabsTrigger value="quick">Quick Login</TabsTrigger>
            <TabsTrigger value="email">Email & Password</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <TabsContent value="quick" className="space-y-4">
                <div className="text-center text-sm text-muted-foreground mb-2">
                  Select your role to login quickly
                </div>
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
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'} 
                        className="pl-10 pr-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Default password for migrated accounts is: <code>password123</code>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? 'Logging in...' 
                  : loginMethod === 'quick'
                    ? `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                    : 'Login'
                }
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
