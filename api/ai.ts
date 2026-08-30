import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { handleOptions, json, logError, readBody } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';
import { createChatCompletionWithFallback } from './_lib/groq.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const { action } = req.query;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: 'Groq API key not configured' });
    }
    const groq = new Groq({ apiKey });

    // ----------------------------------------------------
    // ACTION: summarize
    // ----------------------------------------------------
    if (action === 'summarize') {
      if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });

      const body = readBody<{ resumeText?: string }>(req);
      const rawText = body.resumeText;
      if (!rawText || !rawText.trim()) return json(res, 400, { error: 'Resume text is required' });

      const resumeText = rawText.slice(0, 12000);
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

      const chatCompletion = await createChatCompletionWithFallback(groq, {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const summaryHtml = chatCompletion.choices[0]?.message?.content || "";
      const cleanHtml = summaryHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();
      return json(res, 200, { html: cleanHtml });
    }

    // ----------------------------------------------------
    // ACTION: parse
    // ----------------------------------------------------
    if (action === 'parse') {
      const body = readBody<{ resumeText?: string }>(req);
      const rawText = body.resumeText;
      if (!rawText || !rawText.trim()) return json(res, 400, { error: 'Resume text is required' });

      const resumeText = rawText.slice(0, 12000);
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

      const chatCompletion = await createChatCompletionWithFallback(groq, {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "{}";
      try {
        const parsedData = JSON.parse(responseText);
        return json(res, 200, { data: parsedData });
      } catch {
        logError('parse-resume', 'Failed to parse JSON', { responseText });
        return json(res, 500, { error: 'Failed to parse resume correctly' });
      }
    }

    // ----------------------------------------------------
    // ACTION: cover-letter
    // ----------------------------------------------------
    if (action === 'cover-letter') {
      const body = readBody<{ 
        resumeData?: Record<string, string>; 
        jobTitle?: string;
        jobDescription?: string;
        department?: string;
      }>(req);
      
      if (!body.resumeData || !body.jobTitle) {
        return json(res, 400, { error: 'Resume data and job title are required' });
      }

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

      const chatCompletion = await createChatCompletionWithFallback(groq, {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const coverLetter = chatCompletion.choices[0]?.message?.content || "";
      return json(res, 200, { coverLetter });
    }

    return json(res, 400, { error: 'Invalid AI action' });

  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    logError(`ai-endpoint-${action}`, error);
    return json(res, 500, { error: `Failed to process AI request: ${message}` });
  }
}
