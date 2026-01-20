import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  order: Order
) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("zh-HK", {
      style: "currency",
      currency: "HKD",
      minimumFractionDigits: 2,
    }).format(n);

  // Parse product images
  const itemsHtml = order.items
    .map((item) => {
      let thumbnail = "/placeholder.svg";
      try {
        const images = JSON.parse(item.product.images);
        thumbnail = Array.isArray(images) && images.length > 0 ? images[0] : thumbnail;
      } catch (e) {
        // Use default if parsing fails
      }

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="60">
                  <img src="${thumbnail}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
                </td>
                <td style="padding-left: 12px;">
                  <strong>${item.product.name}</strong><br />
                  <span style="color: #666;">數量: ${item.quantity}</span>
                </td>
                <td align="right" style="white-space: nowrap;">
                  ${fmt(item.price * item.quantity)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>訂單確認</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #3d485e; padding: 10px; text-align: center;">
                  <img width="90" height="90" alt="" src="cid:logo-image"/>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 20px 30px;">
<h1 style="font-size: 28px; font-weight: 600; margin-bottom: 30px; text-align:center"> 訂單已完成! </h1>
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">親愛的 ${customerName}，</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                      感謝您的購買！我們已收到您的訂單，並會盡快處理。
                    </p>
                  </td>
                </tr>
                
                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 30px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                      <tr>
                        <td>
                          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">訂單詳情</h2>
                          <p style="margin: 0; color: #666;">訂單編號: <strong>${order.id.substring(0, 8)}</strong></p>
                          <p style="margin: 5px 0 0 0; color: #666;">訂單日期: ${new Date(order.createdAt).toLocaleString("zh-HK", { 
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Hong_Kong"
                          })}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Order Items -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">訂單商品</h2>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${itemsHtml}
                      
                      <!-- Total -->
                      <tr>
                        <td style="padding-top: 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td align="right" style="padding: 8px 0;">
                                <strong style="font-size: 18px;">總計:</strong>
                              </td>
                              <td align="right" style="padding: 8px 0; width: 120px;">
                                <strong style="font-size: 18px;">${fmt(order.totalAmount)}</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Shipping Address -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">送貨地址</h2>
                    <p style="margin: 0; color: #666; line-height: 1.6;">${order.customerAddress}</p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                      如有任何問題，請隨時聯繫我們。
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #999;">
                      © ${new Date().getFullYear()} Glaze Store. 版權所有。
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Glaze Store <onboarding@resend.dev>",
    to: email,
    subject: `訂單確認 - ${order.id.substring(0, 8)}`,
    html: emailHtml,
    attachments: [    {
      path: 'https://cfhrkofmaexmonnieqxo.supabase.co/storage/v1/object/public/product-images/others/glaze-logo.png',
      filename: 'glaze-logo.png',
      contentId: 'logo-image',
    },],
  });

  return result;
}
