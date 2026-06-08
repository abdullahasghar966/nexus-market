import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ReviewDoc {
  product: Types.ObjectId;
  order: Types.ObjectId;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDoc>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    body: { type: String, required: true, minlength: 20 },
    isFlagged: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// A customer may review a given product once per order.
reviewSchema.index({ product: 1, userId: 1, order: 1 }, { unique: true });

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ||
  model<ReviewDoc>("Review", reviewSchema);
