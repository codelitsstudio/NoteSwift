import { NextRequest } from 'next/server';
import { BaseApiHandler } from '../utils/baseHandler';
import Admin from '@/models/Admin';
import connectDB from '@/lib/mongoose';

export class AdminAuthController extends BaseApiHandler {
  async login(req: NextRequest) {
    try {
      await connectDB();
      const body = await this.parseBody(req);
      this.validateRequired(body, ['email', 'password']);

      const { email, password } = body;
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (!admin) return this.unauthorized('Invalid credentials');

      const valid = await admin.comparePassword(password);
      if (!valid) return this.unauthorized('Invalid credentials');

      const tokenPayload = {
        id: admin._id,
        email: admin.email,
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000
      };

      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      return this.success({ admin: { id: admin._id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName }, token }, 'Admin login successful');

    } catch (err: any) {
      console.error('Admin login error:', err);
      return this.handleError(err);
    }
  }
}

export const AdminAuth = new AdminAuthController();
