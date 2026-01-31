import { Schema, model, models, Document } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  avatar?: string;
  job: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    job: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fix for Next.js hot reload - delete model if it exists
if (models.Teacher) {
  delete models.Teacher;
}

const Teacher = model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
