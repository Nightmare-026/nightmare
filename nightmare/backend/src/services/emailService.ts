import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || 'Nightmare <onboarding@resend.dev>';
const adminEmail = process.env.FEEDBACK_EMAIL || 'ganeshsharma714@gmail.com';

export class EmailService {
  /**
   * Send notification to admin when new feedback is submitted
   */
  static async sendAdminFeedbackNotification(feedback: {
    sectionName: string;
    pageUrl: string;
    rating: number;
    message?: string | null;
    email?: string | null;
  }) {
    try {
      const { sectionName, pageUrl, rating, message, email } = feedback;
      
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Feedback: ${rating} Stars for ${sectionName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #7c3aed;">New Site Feedback</h2>
            <p><strong>Section:</strong> ${sectionName}</p>
            <p><strong>URL:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
            <p><strong>Rating:</strong> ${rating}/5 Stars</p>
            <p><strong>User Email:</strong> ${email || 'Anonymous'}</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 10px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message || 'No message provided.'}</p>
            </div>
          </div>
        `
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending admin feedback email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send confirmation email to the user
   */
  static async sendUserFeedbackConfirmation(userEmail: string, name?: string) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject: 'We received your feedback! - Nightmare',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #7c3aed;">Thank You for Your Feedback!</h2>
            <p>Hi ${name || 'User'},</p>
            <p>We've received your feedback and appreciate you taking the time to help us improve <strong>Question Hub</strong>.</p>
            <p>Our team will review your suggestions shortly.</p>
            <br />
            <p>Best regards,</p>
            <p><strong>The Nightmare Team</strong></p>
          </div>
        `
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending user confirmation email:', error);
      return { success: false, error };
    }
  }
}
