import { BrevoAxios } from 'src/configs/axios/axios_helper';
import { OrderItem } from 'src/modules/order/entity/order_item.entity';
import { decryptProfile } from './crypto_helper';

export interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to: { email: string; name: string }[];
  subject: string;
  htmlContent: string;
}

export function BrevoTemplateProvidePassword(
  email: string,
  name: string,
  password: string,
) {
  return {
    sender: {
      name: 'Console Shop Admin',
      email: 'ndchieu73@gmail.com',
    },
    to: [
      {
        email,
        name,
      },
    ],
    subject: 'Mật khẩu mới của bạn',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nền tảng mua sắm an toàn</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Mật khẩu mới của bạn</h2>
          <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
            Xin chào <strong>${name}</strong>,<br><br>
            Một mật khẩu mới đã được tạo cho tài khoản Console Shop của bạn.  
            Vui lòng sử dụng mật khẩu bên dưới để đăng nhập:
          </p>

          <!-- Password Box -->
          <div style="text-align: center; margin: 40px 0;">
            <div style="display: inline-block; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 30px; font-size: 18px; font-weight: bold; color: #212529; font-family: monospace;">
              ${password}
            </div>
          </div>

          <!-- Warning Box -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Quan trọng:</strong> Vì lý do bảo mật, vui lòng thay đổi mật khẩu này sau khi đăng nhập.
            </p>
          </div>

          <!-- Footer Note -->
          <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
            Nếu bạn không yêu cầu mật khẩu mới, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #adb5bd; font-size: 12px; text-align: center; margin: 0;">
            © 2025 Console Shop. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    `,
  };
}

export function BrevoTempleteResetPassword(
  email: string,
  name: string,
  resetLink: string,
) {
  return {
    sender: {
      name: 'Console Shop Admin',
      email: 'ndchieu73@gmail.com',
    },
    to: [
      {
        email,
        name,
      },
    ],
    subject: 'Đặt lại mật khẩu của bạn',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nền tảng mua sắm an toàn</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Đặt lại mật khẩu</h2>
          <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
            Xin chào <strong>${name}</strong>,<br><br>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Console Shop của bạn.
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}"
              style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
              🔄 Đặt lại mật khẩu
            </a>
          </div>

          <!-- Warning Box -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Quan trọng:</strong> Liên kết đặt lại này sẽ hết hạn sau 1 giờ.
            </p>
          </div>

          <!-- Footer Note -->
          <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này một cách an toàn.
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #adb5bd; font-size: 12px; text-align: center; margin: 0;">
            © 2025 Console Shop. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    `,
  };
}

export function BrevoTemplateActiveAccount(
  email: string,
  name: string,
  activeLink: string,
) {
  return {
    sender: {
      name: 'Console Shop Admin',
      email: 'ndchieu73@gmail.com',
    },
    to: [
      {
        email,
        name,
      },
    ],
    subject: 'Kích hoạt tài khoản của bạn',
    htmlContent: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
      <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nền tảng mua sắm an toàn</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">Kích hoạt tài khoản</h2>
      <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
        Xin chào <strong>${name}</strong>,<br><br>
        Cảm ơn bạn đã đăng ký tại Console Shop!  
        Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào nút bên dưới để kích hoạt tài khoản.
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${activeLink}"
          style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: bold;
                font-size: 16px;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">
          ✅ Kích hoạt tài khoản
        </a>
      </div>

      <!-- Warning Box -->
      <div style="background: #e0f7e9; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">
          <strong>ℹ️ Lưu ý:</strong> Liên kết kích hoạt này sẽ hết hạn sau 24 giờ.
        </p>
      </div>

      <!-- Footer Note -->
      <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
        Nếu bạn không tạo tài khoản, vui lòng bỏ qua email này.
      </p>

      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      <p style="color: #adb5bd; font-size: 12px; text-align: center; margin: 0;">
        © 2025 Console Shop. Bảo lưu mọi quyền.
      </p>
    </div>
  </div>
`,
  };
}

export function BrevoTemplatePaymentSuccessPhysical(
  email: string,
  name: string,
  orderItems: OrderItem[],
  to_name: string,
  to_phone: string,
  to_address: string,
  to_provice_name: string,
  to_ward_code: string,
) {
  return {
    sender: {
      name: 'Console Shop Admin',
      email: 'ndchieu73@gmail.com',
    },
    to: [{ email, name }],
    subject: 'Đặt hàng thành công - Đang chờ xác nhận',
    htmlContent: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
      <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nền tảng mua sắm an toàn</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">Đặt hàng thành công!</h2>
      <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
        Xin chào <strong>${name}</strong>,<br><br>
        Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được đặt thành công. Chi tiết như sau:
      </p>

      <!-- Order Details -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Chi tiết đơn hàng</h3>  
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Sản phẩm</th>
              <th style="text-align: center; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Số lượng</th>
              <th style="text-align: right; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (item) => `<tr>
                  <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.productVariant.variant_name}</td>
                  <td style="text-align: center; border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.quantity}</td>
                  <td style="text-align: right; border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.price} VNĐ</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #495057;">Thông tin giao hàng</h3>
        <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
          <strong>Người nhận:</strong> ${to_name}<br>
          <strong>Số điện thoại:</strong> ${to_phone}<br>
          <strong>Địa chỉ:</strong> ${to_address}, ${to_ward_code}, ${to_provice_name}
        </p>
      </div>
    </div>
  </div>
`,
  };
}

export function BrevoTemplatePaymentSuccessDigital(
  email: string,
  name: string,
  orderItems: OrderItem[],
) {
  return {
    sender: {
      name: 'Console Shop Admin',
      email: 'ndchieu73@gmail.com',
    },
    to: [{ email, name }],
    subject: 'Thanh toán thành công - Đơn hàng hoàn tất',
    htmlContent: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1>
      <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nền tảng mua sắm an toàn</p>
    </div>
    <!-- Body -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">Thanh toán thành công!</h2>
      <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
        Xin chào <strong>${name}</strong>,<br><br>
        Cảm ơn bạn đã mua hàng! Thanh toán của bạn đã được xử lý thành công. Chi tiết đơn hàng như sau:
      </p>
      <!-- Order Details -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Chi tiết đơn hàng</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Sản phẩm</th>
              <th style="text-align: center; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Số lượng</th>
              <th style="text-align: right; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (item) => `<tr>
                  <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.productVariant.variant_name}</td>
                  <td style="text-align: center; border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.quantity}</td>
                  <td style="text-align: right; border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.price} VNĐ</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`,
  };
}

export function BrevoTemplateChangeOrderAddressSuccessfully(
  email: string,
  name: string,
  orderItems: OrderItem[],
  to_name: string,
  to_phone: string,
  to_address: string,
  to_provice_name: string,
) {
  return {
    sender: {
      name: 'Console Shop Admin',
      email: 'ndchieu73@gmail.com',
    },
    to: [{ email, name }],
    subject: 'Cập nhật địa chỉ giao hàng thành công',
    htmlContent: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1>
      <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nền tảng mua sắm an toàn</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">Địa chỉ giao hàng đã được cập nhật!</h2>
      <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
        Xin chào <strong>${name}</strong>,<br><br>
        Địa chỉ giao hàng của bạn đã được cập nhật thành công. Chi tiết mới như sau:
      </p>

      <!-- Order Details -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Chi tiết đơn hàng</h3>  
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Sản phẩm</th>
              <th style="text-align: center; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Số lượng</th>
              <th style="text-align: right; border-bottom: 2px solid #e9ecef; padding: 10px 0;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (item) => `<tr>
                  <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.productVariant.variant_name}</td>
                  <td style="text-align: center; border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.quantity}</td>
                  <td style="text-align: right; border-bottom: 1px solid #e9ecef; padding: 10px 0;">${item.price} VNĐ</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Updated Shipping Address -->
      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #495057;">Địa chỉ giao hàng mới</h3>
        <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
          <strong>Người nhận:</strong> ${to_name}<br>
          <strong>Số điện thoại:</strong> ${to_phone}<br>
          <strong>Địa chỉ:</strong> ${to_address}, ${to_provice_name}
        </p>
      </div>
    </div>
  </div>
`,
  };
}

export async function sendMailChangeOrderAddress(
  email: string,
  name: string,
  orderItems: OrderItem[],
  to_name: string,
  to_phone: string,
  to_address: string,
  to_provice_name: string,
  to_ward_code: string,
) {
  const emailData: BrevoEmailPayload =
    BrevoTemplateChangeOrderAddressSuccessfully(
      email,
      name,
      orderItems,
      decryptProfile(to_name),
      decryptProfile(to_phone),
      decryptProfile(to_address),
      to_provice_name,
    );
  return await BrevoAxios.post('/email', emailData);
}

export async function sendMailResetPassword(
  email: string,
  name: string,
  resetLink: string,
) {
  const emailData: BrevoEmailPayload = BrevoTempleteResetPassword(
    email,
    name,
    resetLink,
  );
  return await BrevoAxios.post('/email', emailData);
}

export async function sendMailActiveAccount(
  email: string,
  name: string,
  activeLink: string,
) {
  const emailData: BrevoEmailPayload = BrevoTemplateActiveAccount(
    email,
    name,
    activeLink,
  );
  return await BrevoAxios.post('/email', emailData);
}

export async function sendMailProvidePassword(
  email: string,
  name: string,
  password: string,
) {
  const emailData: BrevoEmailPayload = BrevoTemplateProvidePassword(
    email,
    name,
    password,
  );
  return await BrevoAxios.post('/email', emailData);
}

export async function sendMailPaymentSuccessPhysical(
  email: string,
  name: string,
  orderItems: OrderItem[],
  to_name: string,
  to_phone: string,
  to_address: string,
  to_provice_name: string,
  to_ward_code: string,
) {
  const emailData: BrevoEmailPayload = BrevoTemplatePaymentSuccessPhysical(
    email,
    name,
    orderItems,
    decryptProfile(to_name),
    decryptProfile(to_phone),
    decryptProfile(to_address),
    to_provice_name,
    to_ward_code,
  );
  return await BrevoAxios.post('/email', emailData);
}

export async function sendMailPaymentSuccessDigital(
  email: string,
  name: string,
  orderItems: OrderItem[],
) {
  const emailData: BrevoEmailPayload = BrevoTemplatePaymentSuccessDigital(
    email,
    name,
    orderItems,
  );
  return await BrevoAxios.post('/email', emailData);
}
