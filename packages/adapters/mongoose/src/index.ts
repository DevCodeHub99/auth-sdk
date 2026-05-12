import mongoose, { Schema, Document, Model } from 'mongoose';
import { DatabaseAdapter, User, Session } from '@custom-auth/core';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  passwordHash: { type: String },
  role: { type: String, default: 'user' },
}, { timestamps: true });

export const SessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export interface MongooseConfig {
  UserModel?: Model<any>;
  SessionModel?: Model<any>;
}

export class MongooseAdapter implements DatabaseAdapter {
  private userModel: Model<any>;
  private sessionModel: Model<any>;

  constructor(config?: MongooseConfig) {
    this.userModel = config?.UserModel || mongoose.models.User || mongoose.model('User', UserSchema);
    this.sessionModel = config?.SessionModel || mongoose.models.Session || mongoose.model('Session', SessionSchema);
  }

  private mapUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      role: doc.role,
    };
  }

  private mapSession(doc: any): Session {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      expiresAt: doc.expiresAt,
    };
  }

  async createUser(data: any): Promise<User> {
    const user = await this.userModel.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
    });
    return this.mapUser(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    return user ? this.mapUser(user) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    return user ? this.mapUser(user) : null;
  }

  async createSession(userId: string, expiresAt: Date): Promise<Session> {
    const session = await this.sessionModel.create({
      userId,
      expiresAt,
    });
    return this.mapSession(session);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionModel.findById(sessionId);
    return session ? this.mapSession(session) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionModel.findByIdAndDelete(sessionId);
  }

  async updateUser(id: string, data: any): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) throw new Error('User not found');
    return this.mapUser(user);
  }
}
