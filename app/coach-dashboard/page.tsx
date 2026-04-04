import { redirect } from 'next/navigation';
import CoachDashboardClient from './CoachDashboardClient';

// This would be replaced with actual auth in production
function getSession() {
  // For now, return null - in production this would check cookies/session
  return null;
}

export default async function CoachDashboardPage() {
  const session = getSession();

  // In production, redirect if not authenticated
  // if (!session || session.role !== 'coach') {
  //   redirect('/login');
  // }

  return <CoachDashboardClient />;
}
