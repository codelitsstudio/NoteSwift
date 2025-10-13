import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  
  /**
   * Send verification code email to new teacher
   */
  static async sendVerificationCode(email: string, code: string, firstName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [email],
        subject: 'Verify Your NoteSwift Teacher Account',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Account</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">NoteSwift Teacher</h1>
                <p style="color: #666; margin: 5px 0;">Welcome to our teaching community</p>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-top: 0;">Hi ${firstName}!</h2>
                <p>Thank you for joining NoteSwift as a teacher. To complete your registration, please verify your email address.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: white; display: inline-block; padding: 20px 30px; border-radius: 8px; border: 2px dashed #2563eb;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Your verification code:</p>
                    <h1 style="margin: 10px 0 0 0; color: #2563eb; font-size: 32px; letter-spacing: 8px; font-family: monospace;">${code}</h1>
                  </div>
                </div>
                
                <p>This code will expire in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.</p>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
                <ol style="color: #334155; margin: 0; padding-left: 20px;">
                  <li>Enter the verification code in the app</li>
                  <li>Complete your teaching profile</li>
                  <li>Upload your credentials for verification</li>
                  <li>Start inspiring students!</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  The NoteSwift Team
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
                  If you have any questions, contact us at noteswift@codelitsstudio.com
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        messageId: data?.id,
        message: 'Verification code sent successfully'
      };
      
    } catch (error: any) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message || 'Email service unavailable'
      };
    }
  }

  /**
   * Send welcome email after successful onboarding
   */
  static async sendWelcomeEmail(email: string, firstName: string, lastName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [email],
        subject: 'Welcome to NoteSwift Teacher Community!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to NoteSwift</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;"> Welcome to NoteSwift!</h1>
                <p style="color: #666; margin: 5px 0;">You're now part of our teaching community</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                <h2 style="margin-top: 0; color: white;">Hi ${firstName} ${lastName}!</h2>
                <p style="margin: 0;">Your teacher account has been successfully verified and your profile has been submitted for approval. Our team will review your application within 24-48 hours.</p>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h3 style="color: #1e293b; margin-top: 0;">� Application Status</h3>
                <ul style="color: #334155; padding-left: 20px;">
                  <li><strong>Profile Submitted:</strong> Your complete teacher profile has been received</li>
                  <li><strong>Review Process:</strong> Our team is carefully reviewing your qualifications</li>
                  <li><strong>Approval Timeline:</strong> Most applications are reviewed within 24-48 hours</li>
                  <li><strong>Notification:</strong> You'll receive an email once your application is approved</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #e2e8f0; color: #64748b; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Dashboard access will be granted upon approval
                </div>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="color: #1e40af; margin-top: 0;">What to expect during approval</h3>
                <ul style="color: #334155; margin: 0; padding-left: 20px;">
                  <li>We verify your educational qualifications and teaching experience</li>
                  <li>Subject expertise and teaching credentials are carefully reviewed</li>
                  <li>Once approved, you'll get immediate access to create courses and manage classes</li>
                  <li>Our support team is available if you have any questions during this process</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Happy teaching!<br>
                  The NoteSwift Team
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
                  Need help? Contact us at noteswift@codelitsstudio.com
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send welcome email'
        };
      }

      return {
        success: true,
        messageId: data?.id,
        message: 'Welcome email sent successfully'
      };
      
    } catch (error: any) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message || 'Email service unavailable'
      };
    }
  }

  /**
   * Generate a 6-digit verification code
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendApprovalEmail(email: string, firstName: string, lastName: string) {
    try {
      await this.sendWelcomeEmail(email, firstName, lastName);
      return { success: true };
    } catch (e: any) {
      console.error('sendApprovalEmail error', e);
      return { success: false, error: e?.message || 'Failed to send approval email' };
    }
  }

  static async sendRejectionEmail(email: string, firstName: string, lastName: string, reason: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [email],
        subject: 'Your NoteSwift Teacher Application - Update',
        html: `<p>Hi ${firstName} ${lastName},</p><p>We reviewed your application and, unfortunately, it was not approved.</p><p>Reason: ${reason}</p><p>Feel free to contact support for more details.</p>`
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message || 'Failed to send email' };
      }
      return { success: true, messageId: data?.id };
    } catch (e: any) {
      console.error('sendRejectionEmail error', e);
      return { success: false, error: e?.message || 'Failed to send rejection email' };
    }
  }

}