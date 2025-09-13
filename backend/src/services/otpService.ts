import twilio from 'twilio';

// OTP Service for registration SMS verification
interface OTPResponse {
  success: boolean;
  message: string;
}

class OTPService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private otpStorage: Map<string, { code: string; expires: number }> = new Map();

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API;
    const apiSecret = process.env.TWILIO_SECRET;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !apiKey || !apiSecret || !fromNumber) {
      throw new Error('Twilio credentials not found in environment variables');
    }

    // Use API Key with Account SID
    this.client = twilio(apiKey, apiSecret, { accountSid });
    this.fromNumber = fromNumber;
    
    // Fixed phone number formatting issue
    console.log(`🚀 Twilio OTP Service initialized with phone: ${fromNumber}`);
  }

  // Generate a 4-digit OTP
  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Format phone number to international format
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit Nepal number, add country code
    if (cleaned.length === 10 && (cleaned.startsWith('97') || cleaned.startsWith('98'))) {
      return `+977${cleaned}`;
    }
    
    // If it already has country code
    if (cleaned.length === 13 && cleaned.startsWith('977')) {
      return `+${cleaned}`;
    }
    
    return `+977${cleaned}`;
  }

  async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const otpCode = this.generateOTP();
      
      // Store OTP with 5-minute expiry
      this.otpStorage.set(formattedPhone, {
        code: otpCode,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      console.log(`📱 Sending OTP ${otpCode} to ${formattedPhone}`);

      // Send real SMS via Twilio
      const message = await this.client.messages.create({
        body: `Your NoteSwift verification code is: ${otpCode}. Valid for 5 minutes.`,
        from: this.fromNumber,
        to: formattedPhone,
      });

      console.log(`✅ SMS sent successfully: ${message.sid}`);
      
      return {
        success: true,
        message: 'OTP sent successfully'
      };

    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  async verifyOTP(phoneNumber: string, otpCode: string): Promise<OTPResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const storedOTP = this.otpStorage.get(formattedPhone);

      console.log(`🔍 Verifying OTP for ${formattedPhone}`);
      console.log(`📧 Received OTP: "${otpCode}"`);
      console.log(`💾 Stored OTP data:`, storedOTP);

      if (!storedOTP) {
        console.log(`❌ No OTP found for phone: ${formattedPhone}`);
        return {
          success: false,
          message: 'No OTP found for this number'
        };
      }

      if (Date.now() > storedOTP.expires) {
        console.log(`⏰ OTP expired for ${formattedPhone}`);
        this.otpStorage.delete(formattedPhone);
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      console.log(`🔢 Comparing: received="${otpCode}" vs stored="${storedOTP.code}"`);
      
      if (storedOTP.code !== otpCode) {
        console.log(`❌ OTP mismatch for ${formattedPhone}`);
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      // OTP is valid, remove it
      this.otpStorage.delete(formattedPhone);
      console.log(`✅ OTP verified successfully for ${formattedPhone}`);
      
      return {
        success: true,
        message: 'OTP verified successfully'
      };

    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }
}

const otpService = new OTPService();
export default otpService;
