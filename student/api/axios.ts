import axios from "axios";

export const URI = "http://172.20.10.2:5000/api";

const api = axios.create({
    baseURL: URI,
    withCredentials: true, // keep if using cookies/sessions
    // headers: { 'Access-Control-Allow-Origin': '*' } // remove this
});

export default api;
