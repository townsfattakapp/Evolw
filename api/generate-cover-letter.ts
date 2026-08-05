import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
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

    const body = readBody<{ 
      resumeData?: Record<string, string>; 
      jobTitle?: string;
      jobDescription?: string;
      department?: string;
    }>(req);
    
    if (!body.resumeData || !body.jobTitle) {
      return json(res, 400, { error: 'Resume data and job title are required' });
    }

    const groq = new Groq({ apiKey });
    
    const prompt = `
      You are an expert career coach helping a candidate write a compelling, professional cover letter.
      
      Job Title: ${body.jobTitle}
      Department: ${body.department || 'N/A'}
      Job Description:
      ${body.jobDescription || 'N/A'}
      
      Candidate Data:
      ${JSON.stringify(body.resumeData, null, 2)}
      
      Please write a concise, engaging, and professional cover letter (about 3-4 paragraphs). 
      It should highlight the candidate's skills and experience relevant to the job description.
      Do not include placeholder brackets like [Your Name] or [Date] at the top, just output the main body of the cover letter.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192', // Llama 3 8B is fast and suitable for cover letters, or could use 70b
      temperature: 0.7,
    });

    const coverLetter = chatCompletion.choices[0]?.message?.content || "";

    return json(res, 200, { coverLetter });
  } catch (error) {
    logError('generate-cover-letter', error);
    return json(res, 500, { error: 'Failed to generate cover letter' });
  }
}
