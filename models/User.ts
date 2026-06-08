import { Schema, model, models, type Model } from "mongoose";
import type { UserRole } from "@/types";

export interface AddressDoc {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UserDoc {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  addresses: AddressDoc[];
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const addressSchema = new Schema<AddressDoc>(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false },
);

const userSchema = new Schema<UserDoc>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
      index: true,
    },
    addresses: { type: [addressSchema], default: [] },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
