import { redirect } from 'next/navigation';

export default function AdminDashboardRedirect() {
  // This page redirects to the main dashboard
  redirect('/dashboard');
}
