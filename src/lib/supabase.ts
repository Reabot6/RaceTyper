import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_wpm: number | null;
  challenger_accuracy: number | null;
  challenged_wpm: number | null;
  challenged_accuracy: number | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  challenge_id: string;
  amount: number;
  token_address: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function createChallenge(challengedId: string, wpm: number, accuracy: number) {
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      challenger_id: supabase.auth.user()?.id,
      challenged_id: challengedId,
      challenger_wpm: wpm,
      challenger_accuracy: accuracy,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBet(challengeId: string, amount: number, tokenAddress: string) {
  const { data, error } = await supabase
    .from('bets')
    .insert({
      challenge_id: challengeId,
      amount,
      token_address: tokenAddress,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChallenge(
  challengeId: string,
  wpm: number,
  accuracy: number
) {
  const user = supabase.auth.user();
  if (!user) throw new Error('Not authenticated');

  const { data: challenge, error: fetchError } = await supabase
    .from('challenges')
    .select()
    .eq('id', challengeId)
    .single();

  if (fetchError) throw fetchError;

  const updates = user.id === challenge.challenger_id
    ? { challenger_wpm: wpm, challenger_accuracy: accuracy }
    : { challenged_wpm: wpm, challenged_accuracy: accuracy };

  const { data, error } = await supabase
    .from('challenges')
    .update(updates)
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserChallenges() {
  const user = supabase.auth.user();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      bets (*)
    `)
    .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}