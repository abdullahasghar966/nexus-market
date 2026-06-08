/**
 * Transactional email via Resend — SERVER ONLY.
 *
 * Build-safe and graceful: when `RESEND_API_KEY` is absent the helpers no-op and
 * return `{ sent: false, skipped: true }` instead of throwing, so order
 * placement never fails just because email isn't configured.
 */
import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

let resendSingleton: Resend | null = null;

function getResend(): Resend | null {
  if (resendSingleton) return resendSingleton;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendSingleton = new Resend(key);
  return resendSingleton;
}

/** Sender identity — override with RESEND_FROM once a domain is verified. */
const FROM = process.env.RESEND_FROM ?? "Nexus Market <onboarding@resend.dev>";

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderEmailInput {
  to: string;
  orderNumber: string;
  items: OrderEmailItem[];
  total: number;
}

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

function orderConfirmationHtml(input: OrderEmailInput): string {
  const rows = input.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;color:#1a1b22;font-size:14px;">${escapeHtml(
            i.name,
          )} &times; ${i.quantity}</td>
          <td style="padding:8px 0;color:#1a1b22;font-size:14px;text-align:right;">${formatPrice(
            i.price * i.quantity,
          )}</td>
        </tr>`,
    )
    .join("");

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#ffffff;color:#1a1b22;">
    <h1 style="color:#00288e;font-size:24px;margin:0 0 8px;">Thanks for your order!</h1>
    <p style="color:#444653;font-size:14px;margin:0 0 24px;">
      We've received order <strong>${escapeHtml(
        input.orderNumber,
      )}</strong> and it's now being prepared. You'll get another note when it ships.
    </p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin-bottom:16px;">
      ${rows}
    </table>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:4px 0;font-weight:700;font-size:16px;">Total</td>
        <td style="padding:4px 0;font-weight:700;font-size:16px;text-align:right;color:#00288e;">${formatPrice(
          input.total,
        )}</td>
      </tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/track?order=${encodeURIComponent(
      input.orderNumber,
    )}"
       style="display:inline-block;margin-top:24px;background:#00288e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
      Track your order
    </a>
    <p style="color:#7a7c89;font-size:12px;margin-top:32px;">Nexus Market — the global marketplace for quality goods.</p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Send an order-confirmation email. Never throws — returns a result object. */
export async function sendOrderConfirmation(
  input: OrderEmailInput,
): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return { sent: false, skipped: true };
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: `Your Nexus Market order ${input.orderNumber}`,
      html: orderConfirmationHtml(input),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
