import { getClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/types/database';

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}

export async function getUsersByRole(role: UserRole): Promise<Profile[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('level', { ascending: false });

  if (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }

  return data;
}

export async function getUserById(userId: string): Promise<Profile | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

export async function getCoaches(): Promise<Profile[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .contains('available_roles', ['nunu'])
    .order('level', { ascending: false });

  if (error) {
    console.error('Error fetching coaches:', error);
    return [];
  }

  return data;
}

export async function getCoachStudents(coachId: string): Promise<Profile[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('coach_students')
    .select(`
      *,
      student:profiles!coach_students_student_id_fkey(*)
    `)
    .eq('coach_id', coachId);

  if (error) {
    console.error('Error fetching coach students:', error);
    return [];
  }

  return data.map((cs: { student: unknown }) => cs.student as Profile);
}

export async function assignStudentToCoach(studentId: string, coachId: string): Promise<boolean> {
  const supabase = getClient();

  // Update student's assigned_nunu_id
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ assigned_nunu_id: coachId })
    .eq('id', studentId);

  if (updateError) {
    console.error('Error updating student:', updateError);
    return false;
  }

  // Create coach_students record
  const { error: insertError } = await supabase
    .from('coach_students')
    .insert({
      coach_id: coachId,
      student_id: studentId,
    });

  if (insertError) {
    console.error('Error creating assignment:', insertError);
    return false;
  }

  return true;
}

export async function updateUserLevel(userId: string, level: number): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('profiles')
    .update({ level: Math.min(Math.max(level, 1), 12) })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user level:', error);
    return false;
  }

  return true;
}

export async function updateSubscription(
  userId: string,
  planType: 'basic' | 'club',
  status: 'active' | 'trial' | 'canceled' | 'expired',
  billingCycle?: 'monthly' | 'yearly'
): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: planType,
      subscription_status: status,
      billing_cycle: billingCycle,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }

  return true;
}
