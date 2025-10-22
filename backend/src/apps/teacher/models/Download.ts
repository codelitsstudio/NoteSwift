import { Schema, model, Types } from 'mongoose';

const DownloadSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUri: { type: String, required: true },
  size: { type: String },
  pages: { type: Number },
  downloadedAt: { type: Date, default: Date.now },
});

export default model('Download', DownloadSchema);
