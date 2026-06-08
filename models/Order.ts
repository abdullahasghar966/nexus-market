import { Schema, model, models, type Model } from "mongoose";
import { addressSchema, type AddressDoc } from "./User";
import type { OrderStatus } from "@/types";

export interface OrderItemDoc {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
}

export interface OrderDoc {
  orderNumber: string;
  userId: string;
  email: string;
  items: OrderItemDoc[];
  shippingAddress: AddressDoc;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItemDoc>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    vendorId: { type: String, required: true },
    vendorName: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    paymentIntentId: { type: String, index: true },
  },
  { timestamps: true },
);

export const Order: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) || model<OrderDoc>("Order", orderSchema);
