import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { handleOptions, json, logError, readBody } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  // Only admins can summarize resumes
  if (!requireAdmin(req)) {
    return json(res, 401, { error: 'Unauthorized' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: 'Groq API key not configured' });
    }

    const body = readBody<{ resumeText?: string }>(req);
    const rawText = body.resumeText;

    if (!rawText || !rawText.trim()) {
      return json(res, 400, { error: 'Resume text is required' });
    }

    // Truncate to avoid context limits
    const resumeText = rawText.slice(0, 12000);

    const groq = new Groq({ apiKey });
    
    const prompt = `
      You are an expert HR recruiter and assistant.
      Provide a detailed, highly readable summary of the following resume.
      Your summary should be formatted as clean HTML.
      Rules for formatting:
      - Use <p> tags for paragraphs.
      - Use <ul> and <li> tags for lists.
      - Use <strong> tags to boldly highlight important points (like key skills, impressive achievements, or notable companies).
      - Make it easy to catch through the eyes.
      - Do NOT use markdown. Return ONLY valid HTML.
      - Keep it concise but detailed enough to give a complete overview of the candidate's profile.
      
      Resume text:
      ${resumeText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    const summaryHtml = chatCompletion.choices[0]?.message?.content || "";
    
    // Sometimes the model wraps HTML in markdown blocks like \`\`\`html ... \`\`\`
    const cleanHtml = summaryHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

    return json(res, 200, { html: cleanHtml });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    logError('summarize-resume', error);
    return json(res, 500, { error: `Failed to summarize resume: ${message}` });
  }
}
