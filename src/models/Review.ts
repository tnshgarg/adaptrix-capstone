import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  rating: number;
  comment?: string;
  adapterId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

ReviewSchema.index({ adapterId: 1, userId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
