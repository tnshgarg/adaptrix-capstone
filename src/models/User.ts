import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  username?: string;
  password?: string;
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  avatar: { type: String },
  bio: { type: String },
  githubUrl: { type: String },
  twitterUrl: { type: String },
  websiteUrl: { type: String },
  location: { type: String },
}, {
  timestamps: true,
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
