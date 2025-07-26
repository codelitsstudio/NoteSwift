export interface TCourse {
    _id: string
    title: string;
    description: string;
    subject: string;
    tags: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
