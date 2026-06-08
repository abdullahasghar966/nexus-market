import { Schema, model, models, type Model } from "mongoose";
import type { VendorStatus } from "@/types";

export interface VendorDoc {
  slug: string;
  name: string;
  tagline?: string;
  bio?: string;
  logo?: string;
  banner?: string;
  location?: string;
  ownerId: string;
  status: VendorStatus;
  rating: { average: number; count: number };
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<VendorDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    bio: { type: String },
    logo: { type: String },
    banner: { type: String },
    location: { type: String },
    ownerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Vendor: Model<VendorDoc> =
  (models.Vendor as Model<VendorDoc>) ||
  model<VendorDoc>("Vendor", vendorSchema);
