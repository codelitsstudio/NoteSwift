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
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">

        <div style="padding: 40px 40px 20px; text-align: center;">
            <img src="https://i.postimg.cc/Gh6L7sKL/IMG-4146.png" alt="NoteSwift Logo" style="width: 150px; height: auto; margin-bottom: 20px;" onerror="this.onerror=null;this.src='https://placehold.co/150x50/007AFF/ffffff?text=NoteSwift&font=raleway';">
        </div>

        <div style="padding: 0 40px 30px;">

            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 22px; text-align: center;">Verify Your Email Address</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Welcome to NoteSwift! We're excited to have you on board. Please use the verification code below to confirm your email and activate your account.
            </p>
            
            <div style="background-color: #e6f2ff; border: 2px dashed #99cfff; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <p style="margin:0; color: #374151; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
                <span style="font-size: 36px; font-weight: bold; color: #007AFF; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${otpCode}</span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 20px;">
                For security reasons, this code will expire in <strong>10 minutes</strong>.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} NoteSwift. All rights reserved.<br>
                123 Swift Street, Innovation City, 12345
            </p>
        </div>
    </div>
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
