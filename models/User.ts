import { Document, Schema, models, model } from 'mongoose';

interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string; // Optional if you handle password hashing separately
  grade: "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
  education: "General" | "Azher";
  role: "user" | "teacher" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
    enum: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
  },
  education: {
    type: String,
    required: true,
    enum: ["General", "Azher"]
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "teacher", "admin"]
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Fix for Next.js hot reload - delete model if it exists
if (models.User) {
  delete models.User;
}

const User = model<IUser>('User', UserSchema);

export default User;
