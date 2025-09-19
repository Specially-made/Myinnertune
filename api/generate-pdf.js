import { PDFDocument, rgb } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { sessionId, language } = req.body;
  const { data: session } = await supabase.from('sessions').select('*').eq('session_id', sessionId).single();
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { height } = page.getSize();
  page.drawText('MyInnerTune Report', { x: 50, y: height - 50, size: 30, color: rgb(0, 0, 0) });
  page.drawText(`Language: ${language}`, { x: 50, y: height - 100, size: 12 });
  page.drawText(`Improvement: ${session.improvement}`, { x: 50, y: height - 150, size: 12 });
  page.drawText(JSON.stringify(session.statements), { x: 50, y: height - 200, size: 12 });
  const pdfBytes = await pdfDoc.save();

  const fileName = `pdf_${sessionId}.pdf`;
  await supabase.storage.from('pdfs').upload(fileName, pdfBytes, { contentType: 'application/pdf' });
  const { data: { signedUrl } } = await supabase.storage.from('pdfs').createSignedUrl(fileName, 3600); // 1 hour expiry
  res.status(200).json({ downloadUrl: signedUrl });
}