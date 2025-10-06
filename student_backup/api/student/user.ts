import api from "../axios"
import { TStudentWithNoSensitive } from "@shared/model/students/Student"

export const getFetchCurrentUser = async() => {
    const res = await api.get("/student/user/me");
    return res.data as ApiResponse<TStudentWithNoSensitive>;
}

export interface UpdateUserData {
  full_name?: string;
  grade?: number;
  email?: string;
  address?: {
    province?: string;
    district?: string;
    institution?: string;
  };
}

export const updateUserProfile = async (data: UpdateUserData) => {
  try {
    console.log('Sending update data:', data);
    const response = await api.put('/student/user/me', data);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Profile update error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const uploadProfileImage = async (imageData: string) => {
  try {
    console.log('📤 Uploading profile image...');
    const response = await api.post('/student/user/upload-profile-image', { imageData });
    console.log('✅ Profile image upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Profile image upload error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to upload profile image');
  }
};

// Email Change Flow APIs

export const sendCurrentEmailVerification = async () => {
  try {
    console.log('📧 Sending verification to current email...');
    const response = await api.post('/student/user/email-change/send-current-verification');
    console.log('✅ Current email verification sent:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to send verification code');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Send current email verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send verification code');
  }
};

export const verifyCurrentEmail = async (otpCode: string) => {
  try {
    console.log('🔐 Verifying current email...');
    const response = await api.post('/student/user/email-change/verify-current', { otp_code: otpCode });
    console.log('✅ Current email verified:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Verification failed');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Verify current email error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to verify current email');
  }
};

export const sendNewEmailVerification = async (newEmail: string) => {
  try {
    console.log('📧 Sending verification to new email:', newEmail);
    const response = await api.post('/student/user/email-change/send-new-verification', { newEmail });
    console.log('✅ New email verification sent:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to send verification code to new email');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Send new email verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send verification code to new email');
  }
};

export const verifyNewEmailAndUpdate = async (newEmail: string, otpCode: string) => {
  try {
    console.log('🔐 Verifying new email and updating...');
    const response = await api.post('/student/user/email-change/verify-and-update', { 
      newEmail, 
      otp_code: otpCode 
    });
    console.log('✅ Email updated successfully:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to update email address');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Verify new email and update error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update email address');
  }
};

// Password Change Flow APIs

export const verifyCurrentPassword = async (currentPassword: string) => {
  try {
    console.log('🔐 Verifying current password...');
    const response = await api.post('/student/user/password-change/verify-current', { currentPassword });
    console.log('✅ Current password verified:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Current password verification failed');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Verify current password error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to verify current password');
  }
};

export const changePasswordWithCurrent = async (currentPassword: string, newPassword: string) => {
  try {
    console.log('🔒 Changing password with current password...');
    const response = await api.post('/student/user/password-change/change-with-current', { 
      currentPassword, 
      newPassword 
    });
    console.log('✅ Password changed successfully:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to change password');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Change password error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
  }
};

export const sendForgotPasswordOTP = async () => {
  try {
    console.log('📧 Sending forgot password OTP...');
    const response = await api.post('/student/user/password-change/send-forgot-otp');
    console.log('✅ Forgot password OTP sent:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to send verification code');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Send forgot password OTP error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send verification code');
  }
};

export const verifyForgotPasswordOTP = async (otpCode: string) => {
  try {
    console.log('🔐 Verifying forgot password OTP...');
    const response = await api.post('/student/user/password-change/verify-forgot-otp', { otp_code: otpCode });
    console.log('✅ Forgot password OTP verified:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'OTP verification failed');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Verify forgot password OTP error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to verify OTP');
  }
};

export const resetPasswordWithOTP = async (otpCode: string, newPassword: string) => {
  try {
    console.log('🔒 Resetting password with OTP...');
    const response = await api.post('/student/user/password-change/reset-with-otp', { 
      otp_code: otpCode, 
      newPassword 
    });
    console.log('✅ Password reset successfully:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to reset password');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Reset password error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to reset password');
  }
};

// Notification Preferences APIs

export interface NotificationPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
  lesson_reminders: boolean;
  progress_updates: boolean;
  course_announcements: boolean;
  study_streak_reminders: boolean;
  weekly_progress_report: boolean;
  new_content_alerts: boolean;
}

export const getNotificationPreferences = async () => {
  try {
    console.log('📱 Getting notification preferences...');
    const response = await api.get('/student/user/notification-preferences');
    console.log('✅ Notification preferences retrieved:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to get notification preferences');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get notification preferences error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get notification preferences');
  }
};

export const updateNotificationPreferences = async (preferences: NotificationPreferences) => {
  try {
    console.log('📱 Updating notification preferences...', preferences);
    const response = await api.put('/student/user/notification-preferences', preferences);
    console.log('✅ Notification preferences updated:', response.data);
    
    // Check if the response indicates an error
    if (response.data.error === true) {
      throw new Error(response.data.message || 'Failed to update notification preferences');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Update notification preferences error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update notification preferences');
  }
};