import { getClient } from '@/lib/supabase/client';
import type { Challenge, ChallengeParticipation } from '@/types/database';

export async function getChallenges(): Promise<Challenge[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }

  return data;
}

export async function getActiveChallenge(): Promise<Challenge | null> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }

  return data;
}

export async function joinChallenge(userId: string, challengeId: string): Promise<ChallengeParticipation | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('challenge_participations')
    .upsert({
      user_id: userId,
      challenge_id: challengeId,
      status: 'joined',
    })
    .select()
    .single();

  if (error) {
    console.error('Error joining challenge:', error);
    return null;
  }

  return data;
}

export async function getUserChallengeParticipation(
  userId: string,
  challengeId: string
): Promise<ChallengeParticipation | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('challenge_participations')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function submitChallenge(
  userId: string,
  challengeId: string,
  submissionUrl: string
): Promise<ChallengeParticipation | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('challenge_participations')
    .update({
      status: 'submitted',
      submission_url: submissionUrl,
      submitted_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .select()
    .single();

  if (error) {
    console.error('Error submitting challenge:', error);
    return null;
  }

  return data;
}

export async function getUserChallenges(userId: string): Promise<(ChallengeParticipation & { challenge: Challenge })[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('challenge_participations')
    .select(`
      *,
      challenge:challenges(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }

  return data.map((p: ChallengeParticipation & { challenge: unknown }) => ({
    ...p,
    challenge: p.challenge as Challenge,
  }));
}
