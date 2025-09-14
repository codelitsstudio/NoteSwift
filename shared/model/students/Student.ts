export interface TStudent<T=string>{
    _id: T;
    id?: string;
    full_name: string;
    grade: number;
    email: string;
    password: string;
    address: {
        province: string;
        district: string;
        institution: string
    };
    avatarEmoji: string; // Permanent emoji assigned at registration
    profileImage?: string; // Optional uploaded image URL (Cloudinary)
    notification_preferences?: {
        push_notifications: boolean;
        email_notifications: boolean;
        lesson_reminders: boolean;
        progress_updates: boolean;
        course_announcements: boolean;
        study_streak_reminders: boolean;
        weekly_progress_report: boolean;
        new_content_alerts: boolean;
    };
}

export interface TStudentWithNoSensitive extends Omit<TStudent, "password"> {
  id: string;
  _id: string;
}