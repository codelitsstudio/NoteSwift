import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const URI = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.4:5000/api/student";

const api = axios.create({
    baseURL: URI,
    withCredentials: true, // keep if using cookies/sessions
    // headers: { 'Access-Control-Allow-Origin': '*' } // remove this
});

// Add request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        console.log('🌐 Making request to:', (config.baseURL || '') + (config.url || ''));
        console.log('🌐 Full URL:', `${config.baseURL || ''}${config.url || ''}`);
        console.log('Token available:', token ? 'Yes' : 'No');
        
        if (token) {
            console.log('🔐 Token (first 50 chars):', token.substring(0, 50) + '...');
            console.log('🔐 Token (last 20 chars):', '...' + token.substring(token.length - 20));
            console.log('🔐 Full token length:', token.length);
            console.log('🔐 Token format check:', token.split('.').length === 3 ? 'Valid JWT format' : `Invalid JWT format (${token.split('.').length} parts)`);
            
            // Try to decode the JWT header to verify format
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const header = JSON.parse(atob(parts[0]));
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('🔐 JWT Header:', header);
                    console.log('🔐 JWT Payload user_id:', payload.user_id);
                    console.log('🔐 JWT Payload role:', payload.role);
                    console.log('🔐 JWT Expires:', new Date(payload.exp * 1000));
                } else {
                    console.log('🚨 Invalid JWT format - wrong number of parts');
                }
            } catch (e) {
                console.log('🚨 Failed to decode JWT:', e);
            }
            
            // Send token as Authorization header (primary method)
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Added Authorization header and cookie');
            console.log('📤 Final Authorization header:', config.headers.Authorization?.substring(0, 50) + '...');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
