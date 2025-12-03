import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStar extends Document {
  adapterId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StarSchema: Schema = new Schema({
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

StarSchema.index({ adapterId: 1, userId: 1 }, { unique: true });

const Star: Model<IStar> = mongoose.models.Star || mongoose.model<IStar>('Star', StarSchema);

export default Star;
