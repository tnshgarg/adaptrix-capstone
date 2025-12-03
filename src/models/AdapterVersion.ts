import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdapterVersion extends Document {
  version: string;
  changelog?: string;
  fileName?: string;
  filePath?: string;
  size?: string;
  downloads: number;
  adapterId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AdapterVersionSchema: Schema = new Schema({
  version: { type: String, required: true },
  changelog: { type: String },
  fileName: { type: String },
  filePath: { type: String },
  size: { type: String },
  downloads: { type: Number, default: 0 },
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});


AdapterVersionSchema.index({ adapterId: 1, version: 1 }, { unique: true });

const AdapterVersion: Model<IAdapterVersion> = mongoose.models.AdapterVersion || mongoose.model<IAdapterVersion>('AdapterVersion', AdapterVersionSchema);

export default AdapterVersion;
