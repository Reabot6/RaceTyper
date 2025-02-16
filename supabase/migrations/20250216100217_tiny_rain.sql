/*
  # Create challenges and bets tables

  1. New Tables
    - `challenges`
      - `id` (uuid, primary key)
      - `challenger_id` (uuid, references auth.users)
      - `challenged_id` (uuid, references auth.users)
      - `challenger_wpm` (integer)
      - `challenger_accuracy` (integer)
      - `challenged_wpm` (integer)
      - `challenged_accuracy` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `bets`
      - `id` (uuid, primary key)
      - `challenge_id` (uuid, references challenges)
      - `amount` (bigint)
      - `token_address` (text)
      - `status` (text)
      - `winner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own challenges
      - Create new challenges
      - Update challenges they're part of
      - Read and create bets for their challenges
*/

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid REFERENCES auth.users NOT NULL,
  challenged_id uuid REFERENCES auth.users NOT NULL,
  challenger_wpm integer,
  challenger_accuracy integer,
  challenged_wpm integer,
  challenged_accuracy integer,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges NOT NULL,
  amount bigint NOT NULL,
  token_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  winner_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Policies for challenges
CREATE POLICY "Users can read their own challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = challenger_id OR
    auth.uid() = challenged_id
  );

CREATE POLICY "Users can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their own challenges"
  ON challenges
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = challenger_id OR
    auth.uid() = challenged_id
  );

-- Policies for bets
CREATE POLICY "Users can read bets for their challenges"
  ON bets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = bets.challenge_id
      AND (
        challenges.challenger_id = auth.uid() OR
        challenges.challenged_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create bets for their challenges"
  ON bets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_id
      AND (
        challenges.challenger_id = auth.uid() OR
        challenges.challenged_id = auth.uid()
      )
    )
  );