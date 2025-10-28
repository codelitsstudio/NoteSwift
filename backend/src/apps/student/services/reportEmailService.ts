import { Resend } from 'resend';

interface ReportEmailResponse {
  success: boolean;
  message: string;
}

class ReportEmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_MOBILE_APP;

    if (!apiKey) {
      throw new Error('Resend API key not found in environment variables');
    }

    this.resend = new Resend(apiKey);

    console.log(`📧 Resend Report Email Service initialized`);
  }

  async sendReportEmail(reportText: string, userEmail?: string): Promise<ReportEmailResponse> {
    try {
      console.log(`📧 Sending Report Email from ${userEmail || 'Anonymous'}`);

      // Send email via Resend
      const { data, error } = await this.resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: ['sujanbhatta0629@gmail.com'],
        subject: 'New Issue Report from NoteSwift App',
        html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">

        <div style="padding: 40px 40px 20px; text-align: center;">
            <img src="https://i.postimg.cc/Gh6L7sKL/IMG-4146.png" alt="NoteSwift Logo" style="width: 150px; height: auto; margin-bottom: 20px;" onerror="this.onerror=null;this.src='https://placehold.co/150x50/007AFF/ffffff?text=NoteSwift&font=raleway';">
        </div>

        <div style="padding: 0 40px 30px;">

            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 22px; text-align: center;">New Issue Report</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                <strong>From:</strong> ${userEmail || 'Anonymous User'}
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                <strong>Report Details:</strong>
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${reportText}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                This report was submitted from the NoteSwift mobile application.
            </p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} NoteSwift. All rights reserved.<br>
            </p>
        </div>
    </div>
</div>
        `,
      });

      if (error) {
        console.error('❌ Error sending report email:', error);
        return {
          success: false,
          message: 'Failed to send report email'
        };
      }

      console.log(`✅ Report email sent successfully: ${data?.id}`);

      return {
        success: true,
        message: 'Report sent successfully'
      };

    } catch (error) {
      console.error('❌ Error in sendReportEmail:', error);
      return {
        success: false,
        message: 'Failed to send report email'
      };
    }
  }
}

const reportEmailService = new ReportEmailService();
export default reportEmailService;