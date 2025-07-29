export interface TAnnouncement <T=string> {
    _id: T;
    subject: string;
    message: string;
    createdBy?: T;
    createdAt: Date;
    updatedAt: Date;
}