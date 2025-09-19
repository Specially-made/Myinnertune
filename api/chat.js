import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, message, language } = req.body;
  const { data: user } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `${message} Respond strictly in ${language === 'DE' ? 'German' : 'English'}.` }],
  });
  const statements = response.choices[0].message.content;
  await supabase.from('sessions').insert({ 
    user_id: userId, 
    entry_score: req.body.entryScore || 5,
    exit_score: req.body.exitScore || 5,
    statements: { text: statements },
    notes: req.body.notes || ''
  });
  res.status(200).json({ statements });
}