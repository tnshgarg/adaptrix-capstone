import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDownload extends Document {
  ipAddress?: string;
  userAgent?: string;
  adapterId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DownloadSchema: Schema = new Schema({
  ipAddress: { type: String },
  userAgent: { type: String },
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

const Download: Model<IDownload> = mongoose.models.Download || mongoose.model<IDownload>('Download', DownloadSchema);

export default Download;
