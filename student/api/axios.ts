import instance from "axios"

export const URI = "http://10.0.2.2:5000/api" 

const api = instance.create({
    baseURL: URI,
    withCredentials: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
})

export default api
