
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { MainAppNav } from '../../components/layout/main-app-nav';
import { getCurrentUser } from '../../lib/auth';
import type { User, NavItem } from '../../types';
import Link from 'next/link';
import { Home, BookOpen, Users, BarChart3, Settings, LogOut, GraduationCap, Edit3, ShieldCheck, ClipboardList } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ThemeToggleButton } from '../../components/layout/theme-toggle-button';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    // This should ideally redirect to login page, but for now, we'll show a message.
    // In a real app, middleware would handle this.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the Miftah Platform.</p>
        <Button asChild className="ml-4"><Link href="/login">Login</Link></Button>
      </div>
    );
  }
  
  const navItems = getNavItems(user.role);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 flex flex-col items-center group-data-[collapsible=icon]:items-start">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">Miftah</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={{ children: item.title, className: "group-data-[collapsible=icon]:block hidden" }}
                  className="group-data-[collapsible=icon]:justify-center"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-4 border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
           <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-semibold text-sm text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="w-full mt-3 group-data-[collapsible=icon]:hidden">
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
           <Button variant="ghost" size="icon" asChild className="w-full mt-2 hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <Link href="/logout"aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            {/* Potentially breadcrumbs or page title here */}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggleButton />
            <MainAppNav user={user} />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function getNavItems(role: User['role']): NavItem[] {
  const baseItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: Home, roles: ['student', 'teacher', 'admin'] },
    { title: 'Courses', href: '/courses', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
  ];

  const studentItems: NavItem[] = [
    { title: 'My Progress', href: '/progress', icon: BarChart3, roles: ['student'] },
    { title: 'Study Plan', href: '/study-plan', icon: ClipboardList, roles: ['student'] },
  ];

  const teacherItems: NavItem[] = [
    { title: 'Manage Courses', href: '/teacher/courses', icon: Edit3, roles: ['teacher'] },
    { title: 'Student Analytics', href: '/teacher/analytics', icon: Users, roles: ['teacher'] },
  ];
  
  const adminItems: NavItem[] = [
    { title: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
    { title: 'Platform Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
    { title: 'System Logs', href: '/admin/logs', icon: ShieldCheck, roles: ['admin'] },
  ];

  let roleSpecificItems: NavItem[] = [];
  if (role === 'student') roleSpecificItems = studentItems;
  else if (role === 'teacher') roleSpecificItems = teacherItems;
  else if (role === 'admin') roleSpecificItems = adminItems;
  
  return [...baseItems, ...roleSpecificItems].filter(item => item.roles?.includes(role));
}
