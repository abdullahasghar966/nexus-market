import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ProductDoc {
  slug: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  category: string;
  tags: string[];
  vendor: Types.ObjectId;
  stockCount: number;
  rating: { average: number; count: number };
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    stockCount: { type: Number, required: true, min: 0, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Text index powers keyword search on the listing page.
productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ||
  model<ProductDoc>("Product", productSchema);
