export interface TSubject <T =string> {
    _id: T,
    subject_name: string;
    createdAt: Date; 
    updatedAt: Date;
}