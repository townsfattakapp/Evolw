import { Resend } from 'resend';
import { logError } from './http.js';

let resend: Resend | null = null;

export function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      resend = new Resend(apiKey);
    }
  }
  return resend;
}

const FROM_EMAIL = 'EVOLW Careers <hello@evolw.in>';

export async function sendStatusUpdateEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  newStatus: string
) {
  const client = getResendClient();
  
  if (!client) {
    console.warn('RESEND_API_KEY not configured. Skipping status email to', applicantEmail);
    return false;
  }

  let subject = '';
  let html = '';

  const firstName = applicantName.split(' ')[0] || 'there';
  const roleName = jobTitle || 'the position you applied for';

  switch (newStatus.toLowerCase()) {
    case 'reviewing':
      subject = 'Update on your application at Evolw';
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Hi ${firstName},</h2>
          <p>We wanted to let you know that your application for the <strong>${roleName}</strong> position is currently under review by our hiring team.</p>
          <p>We appreciate the time you took to apply, and we will get back to you as soon as we have an update.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Evolw Team</strong></p>
        </div>
      `;
      break;

    case 'shortlisted':
      subject = 'Good news! You have been shortlisted at Evolw';
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Congratulations ${firstName}!</h2>
          <p>We are excited to let you know that you have been shortlisted for the <strong>${roleName}</strong> position at Evolw.</p>
          <p>Our team was very impressed by your profile. We will be reaching out to you shortly with details regarding the next steps in our interview process.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Evolw Team</strong></p>
        </div>
      `;
      break;

    case 'hired':
      subject = 'Welcome to Evolw!';
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Congratulations ${firstName}! 🎉</h2>
          <p>We are absolutely thrilled to offer you the <strong>${roleName}</strong> position.</p>
          <p>Our HR team will be in touch with your official offer letter and onboarding details shortly.</p>
          <p>We can't wait to have you on the team!</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Evolw Team</strong></p>
        </div>
      `;
      break;

    case 'rejected':
      subject = 'Update regarding your application at Evolw';
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Hi ${firstName},</h2>
          <p>Thank you very much for your interest in joining Evolw and for applying to the <strong>${roleName}</strong> position.</p>
          <p>After careful consideration, we have decided to move forward with other candidates who more closely align with our current needs for this specific role.</p>
          <p>We wish you the very best in your job search and future career endeavors.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Evolw Team</strong></p>
        </div>
      `;
      break;

    default:
      // Don't send emails for "new" or unknown statuses
      return false;
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      replyTo: 'hello@evolw.in',
      to: [applicantEmail],
      subject,
      html,
    });

    if (error) {
      logError('send-status-email', new Error(error.message));
      return false;
    }

    return true;
  } catch (err) {
    logError('send-status-email', err);
    return false;
  }
}
