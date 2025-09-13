import { Resend } from 'resend';

interface EmailOTPResponse {
  success: boolean;
  message: string;
}

class EmailOTPService {
  private resend: Resend;
  private otpStorage: Map<string, { code: string; expires: number }> = new Map();

  constructor() {
    const apiKey = process.env.RESEND_API_MOBILE_APP;

    if (!apiKey) {
      throw new Error('Resend API key not found in environment variables');
    }

    this.resend = new Resend(apiKey);
    
    console.log(`📧 Resend Email OTP Service initialized`);
  }

  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  async sendEmailOTP(email: string): Promise<EmailOTPResponse> {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      const otpCode = this.generateOTP();
      
      // Store OTP with 10-minute expiry
      this.otpStorage.set(normalizedEmail, {
        code: otpCode,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      });

      console.log(`📧 Sending Email OTP ${otpCode} to ${normalizedEmail}`);

      // Send email via Resend
      const { data, error } = await this.resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [normalizedEmail],
        subject: 'Your NoteSwift Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">NoteSwift</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Thank you for registering with NoteSwift! Please use the verification code below to complete your registration:
            </p>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otpCode}</span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              This verification code will expire in 10 minutes for security reasons.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If you didn't request this verification code, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} NoteSwift. All rights reserved.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Error sending email:', error);
        return {
          success: false,
          message: 'Failed to send verification email'
        };
      }

      console.log(`✅ Email sent successfully: ${data?.id}`);
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      };

    } catch (error: any) {
      console.error('❌ Error sending email OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to send verification email'
      };
    }
  }

  async verifyEmailOTP(email: string, otpCode: string): Promise<EmailOTPResponse> {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      const storedOTP = this.otpStorage.get(normalizedEmail);

      console.log(`🔍 Verifying Email OTP for ${normalizedEmail}`);
      console.log(`📧 Received OTP: "${otpCode}"`);
      console.log(`💾 Stored OTP data:`, storedOTP);

      if (!storedOTP) {
        console.log(`❌ No OTP found for email: ${normalizedEmail}`);
        return {
          success: false,
          message: 'No verification code found for this email'
        };
      }

      if (Date.now() > storedOTP.expires) {
        console.log(`⏰ OTP expired for ${normalizedEmail}`);
        this.otpStorage.delete(normalizedEmail);
        return {
          success: false,
          message: 'Verification code has expired'
        };
      }

      console.log(`🔢 Comparing: received="${otpCode}" vs stored="${storedOTP.code}"`);
      
      if (storedOTP.code !== otpCode) {
        console.log(`❌ OTP mismatch for ${normalizedEmail}`);
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      // OTP is valid, remove it after successful verification
      // TEMPORARILY DISABLED FOR TESTING - REMOVE IN PRODUCTION
      // this.otpStorage.delete(normalizedEmail);
      console.log(`✅ Email OTP verified successfully for ${normalizedEmail} (OTP kept for testing)`);
      
      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error: any) {
      console.error('❌ Error verifying email OTP:', error);
      return {
        success: false,
        message: 'Failed to verify email'
      };
    }
  }
}

const emailOTPService = new EmailOTPService();
export default emailOTPService;
