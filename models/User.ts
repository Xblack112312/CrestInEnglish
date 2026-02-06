import { Document, Schema, models, model } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  grade: "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
  education: "General" | "Azher";
  role: "user" | "teacher" | "admin";
  motivationOptIn: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    motivationOptIn: { type: Boolean, default: true },

    grade: {
      type: String,
      required: true,
      enum: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    },
    education: {
      type: String,
      required: true,
      enum: ["General", "Azher"],
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "teacher", "admin"],
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

if (models.User) delete models.User;

export default model<IUser>("User", UserSchema);
