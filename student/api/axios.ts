import axios from "axios";

export const URI = "http://192.168.1.64:5000/api"; // use your actual machine IP

const api = axios.create({
    baseURL: URI,
    withCredentials: true, // keep if using cookies/sessions
    // headers: { 'Access-Control-Allow-Origin': '*' } // remove this
});

export default api;
