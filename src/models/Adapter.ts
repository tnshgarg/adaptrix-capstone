import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdapter extends Document {
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  compatibleModels: string[];
  size: string;
  license: string;
  repository?: string;
  readme?: string;
  fileName?: string;
  filePath?: string;
  isPublic: boolean;
  downloads: number;
  starCount: number;
  authorId: mongoose.Types.ObjectId;
  author?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AdapterSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  compatibleModels: { type: [String], default: [] },
  size: { type: String },
  license: { type: String, default: 'MIT' },
  repository: { type: String },
  readme: { type: String },
  fileName: { type: String },
  filePath: { type: String },
  isPublic: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 },
  starCount: { type: Number, default: 0 },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


AdapterSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

const Adapter: Model<IAdapter> = mongoose.models.Adapter || mongoose.model<IAdapter>('Adapter', AdapterSchema);

export default Adapter;
