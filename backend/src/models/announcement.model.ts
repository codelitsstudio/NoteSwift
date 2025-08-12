import { TAnnouncement } from '@shared/model/admin/Announcement';
import { Schema, models, Types, model } from "mongoose";


const announcementSchema = new Schema<TAnnouncement<Types.ObjectId>> ({
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        required:false,
    }
},
{
    timestamps: true,
});


export const Announcement =
  models.Announcement || model("Announcement", announcementSchema);