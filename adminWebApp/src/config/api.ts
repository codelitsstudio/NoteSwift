/**
 * Centralized API Configuration for Admin Dashboard
 * All API endpoints point to the Express backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5002';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  
  // ==================== AUTH (Regular Admins) ====================
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/admin/auth/login`,
    VERIFY_OTP: `${API_BASE_URL}/api/admin/auth/verify-otp`,
    COMPLETE_LOGIN: `${API_BASE_URL}/api/admin/auth/complete-login`,
    SESSION: `${API_BASE_URL}/api/admin/auth/session`,
    REFRESH: `${API_BASE_URL}/api/admin/auth/session/refresh`,
    LOGOUT: `${API_BASE_URL}/api/admin/auth/logout`,
  },

  // ==================== ADMIN AUTH (System Admin) ====================
  ADMIN_AUTH: {
    LOGIN: `${API_BASE_URL}/api/admin/admin-auth/login`,
    VERIFY_OTP: `${API_BASE_URL}/api/admin/admin-auth/verify-otp`,
    VERIFY_INVITATION: `${API_BASE_URL}/api/admin/admin-auth/verify-invitation`,
    COMPLETE_SIGNUP: `${API_BASE_URL}/api/admin/admin-auth/complete-signup`,
    PROFILE: `${API_BASE_URL}/api/admin/admin-auth/profile`,
  },

  // ==================== TEACHERS ====================
  TEACHERS: {
    LIST: `${API_BASE_URL}/api/admin/teachers`,
    DROPDOWN: `${API_BASE_URL}/api/admin/admin/teachers`, // Lightweight for dropdowns
    GET: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}`,
    APPROVE: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}/approve`,
    REJECT: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}/reject`,
    BAN: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}/ban`,
    REMOVE: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}/remove`,
    ASSIGN: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}/assign`,
    REMOVE_ASSIGNMENT: (id: string) => `${API_BASE_URL}/api/admin/teachers/${id}/remove-assignment`,
  },

  // ==================== COURSES ====================
  COURSES: {
    LIST: `${API_BASE_URL}/api/admin/courses`, // Full course data
    DROPDOWN: `${API_BASE_URL}/api/admin/admin/courses`, // Lightweight for dropdowns
    CREATE: `${API_BASE_URL}/api/admin/courses`,
    GET: (id: string) => `${API_BASE_URL}/api/admin/courses/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/admin/courses/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/admin/courses/${id}`,
  },

  // ==================== NOTIFICATIONS ====================
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/admin/notifications`,
    CREATE: `${API_BASE_URL}/api/admin/notifications`,
    DELETE: (id: string) => `${API_BASE_URL}/api/admin/notifications/${id}`,
    ACTIVE_HOMEPAGE: `${API_BASE_URL}/api/admin/notifications/active/homepage`,
  },

  // ==================== RECOMMENDATIONS ====================
  RECOMMENDATIONS: {
    ANALYZE: `${API_BASE_URL}/api/admin/recommendations`,
    STATS: `${API_BASE_URL}/api/admin/recommendations`,
    CHANGES: `${API_BASE_URL}/api/admin/recommendations/course-changes`,
    ANALYZE_ALL: `${API_BASE_URL}/api/admin/recommendations/analyze-all`,
  },

  // ==================== AUDIT LOGS ====================
  AUDIT_LOGS: {
    LIST: `${API_BASE_URL}/api/admin/audit-logs`,
    CREATE: `${API_BASE_URL}/api/admin/audit-logs`,
  },

  // ==================== DASHBOARD ====================
  DASHBOARD: {
    OVERVIEW: `${API_BASE_URL}/api/admin/dashboard`,
  },

  // ==================== USERS ====================
  USERS: {
    LIST: `${API_BASE_URL}/api/admin/users`,
    GET: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
  },

  // ==================== HOMEPAGE SETTINGS ====================
  HOMEPAGE: {
    SETTINGS: `${API_BASE_URL}/api/admin/homepage-settings`,
  },

  // ==================== REVENUE ====================
  REVENUE: {
    OVERVIEW: `${API_BASE_URL}/api/admin/revenue/overview`,
  },

  // ==================== ADMIN MANAGEMENT ====================
  ADMINS: {
    LIST: `${API_BASE_URL}/api/admin/admins`,
    INVITE: `${API_BASE_URL}/api/admin/admins/invite`,
    REMOVE: `${API_BASE_URL}/api/admin/admins/remove`,
    SET_SUPER_ADMIN: `${API_BASE_URL}/api/admin/admins/set-super-admin`,
    DEMOTE_SUPER_ADMIN: `${API_BASE_URL}/api/admin/admins/demote-super-admin`,
  },

  // ==================== ORDERS & PAYMENTS ====================
  ORDERS_PAYMENTS: {
    TRANSACTIONS: {
      LIST: `${API_BASE_URL}/api/admin/orders-payments/transactions`,
      GET: (id: string) => `${API_BASE_URL}/api/admin/orders-payments/transactions/${id}`,
      CREATE: `${API_BASE_URL}/api/admin/orders-payments/transaction`,
    },
    CODES: {
      LIST: `${API_BASE_URL}/api/admin/orders-payments/codes`,
      GET: (id: string) => `${API_BASE_URL}/api/admin/orders-payments/codes/${id}`,
    },
  },

  // ==================== SUBJECT CONTENT ====================
  SUBJECT_CONTENT: {
    GET: `${API_BASE_URL}/api/admin/subject-content`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/admin/subject-content/${id}`,
  },

  // ==================== REPORTS ====================
  REPORTS: {
    OVERVIEW: `${API_BASE_URL}/api/admin/reports/overview`,
  },
};

/**
 * Helper function to create fetch options with credentials
 * IMPORTANT: Always include credentials: 'include' for httpOnly cookies!
 */
export const createFetchOptions = (method: string = 'GET', body?: any): RequestInit => {
  const options: RequestInit = {
    method,
    credentials: 'include', // Essential for sending httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add JWT token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token && options.headers) {
      (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * Example usage:
 * 
 * // GET request
 * const response = await fetch(API_ENDPOINTS.TEACHERS.LIST, createFetchOptions('GET'));
 * 
 * // POST request
 * const response = await fetch(API_ENDPOINTS.TEACHERS.APPROVE('123'), createFetchOptions('POST', { reason: 'Good' }));
 * 
 * // With query params
 * const response = await fetch(`${API_ENDPOINTS.TEACHERS.LIST}?status=pending_approval`, createFetchOptions('GET'));
 */
