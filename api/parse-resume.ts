import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse';
import { handleOptions, json, logError, readBody } from './_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: 'Groq API key not configured' });
    }

    const body = readBody<{ resumeBase64?: string; resumeContentType?: string }>(req);
    if (!body.resumeBase64) {
      return json(res, 400, { error: 'Resume base64 data is required' });
    }

    let base64Data = body.resumeBase64;
    let mimeType = body.resumeContentType || 'application/pdf';

    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(';base64,');
      if (parts.length === 2) {
        mimeType = parts[0].replace('data:', '') || mimeType;
        base64Data = parts[1];
      }
    }
    
    let resumeText = "";
    
    if (mimeType === 'application/pdf' || mimeType.includes('pdf')) {
      try {
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        const data = await pdfParse(pdfBuffer);
        resumeText = data.text;
      } catch (err) {
        logError('parse-resume', 'Failed to extract text from PDF', err);
        return json(res, 500, { error: 'Failed to read PDF file content.' });
      }
    } else {
      return json(res, 400, { error: 'Only PDF format is currently supported for resume parsing.' });
    }

    if (!resumeText || !resumeText.trim()) {
      return json(res, 400, { error: 'Could not extract text from the provided PDF.' });
    }

    const groq = new Groq({ apiKey });
    
    const prompt = `
      You are an expert HR assistant. 
      Please parse the provided resume text and extract the following information as a JSON object:
      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "experience": "Total Years of Experience (e.g. 5 years, just a short string)",
        "skills": "Comma separated list of top 10 relevant skills",
        "linkedin": "LinkedIn Profile URL (if available)",
        "portfolio": "Portfolio or GitHub URL (if available)"
      }
      
      If a field is missing, leave it empty or return "". 
      Output ONLY a JSON object. Do not include markdown code blocks or any other text.
      
      Resume text:
      ${resumeText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      logError('parse-resume', 'Failed to parse JSON from AI response', { responseText });
      return json(res, 500, { error: 'Failed to parse resume correctly' });
    }

    return json(res, 200, { data: parsedData });
  } catch (error) {
    logError('parse-resume', error);
    return json(res, 500, { error: 'Failed to process resume' });
  }
}
