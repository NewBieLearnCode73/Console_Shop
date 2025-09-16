import { BrevoAxios } from 'src/configs/axios/axios_helper';

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
    subject: 'Your New Password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure Shopping Platform</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Your New Password</h2>
          <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
            Hi <strong>${name}</strong>,<br><br>
            A new password has been generated for your Console Shop account.  
            Please use the password below to log in:
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
              <strong>⚠️ Important:</strong> For security reasons, please change this password after logging in.
            </p>
          </div>

          <!-- Footer Note -->
          <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
            If you did not request a new password, please contact our support immediately.
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #adb5bd; font-size: 12px; text-align: center; margin: 0;">
            © 2025 Console Shop. All rights reserved.
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
    subject: 'Reset your password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure Shopping Platform</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
            Hi <strong>${name}</strong>,<br><br>
            We received a request to reset your password for your Console Shop account.
            If you did not make this request, please ignore this email.
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
              🔄 Reset Password
            </a>
          </div>

          <!-- Warning Box -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Important:</strong> This reset link will expire in 1 hour(s).
            </p>
          </div>

          <!-- Footer Note -->
          <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #adb5bd; font-size: 12px; text-align: center; margin: 0;">
            © 2025 Console Shop. All rights reserved.
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
    subject: 'Activate your account',
    htmlContent: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Console Shop</h1> 
      <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure Shopping Platform</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">Activate Your Account</h2>
      <p style="color: #6c757d; line-height: 1.6; margin-bottom: 30px;">
        Hi <strong>${name}</strong>,<br><br>
        Thank you for signing up at Console Shop!  
        Please confirm your email address by clicking the button below to activate your account.
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
          ✅ Activate Account
        </a>
      </div>

      <!-- Warning Box -->
      <div style="background: #e0f7e9; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">
          <strong>ℹ️ Note:</strong> This activation link will expire in 24 hours.
        </p>
      </div>

      <!-- Footer Note -->
      <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
        If you did not create an account, please ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      <p style="color: #adb5bd; font-size: 12px; text-align: center; margin: 0;">
        © 2025 Console Shop. All rights reserved.
      </p>
    </div>
  </div>
`,
  };
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
