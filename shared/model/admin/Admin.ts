export interface TAdmin<T = string>{
    _id: T,
    full_name: string,
    email: string,
    password: string,
}