import axios from 'axios';
import { config } from 'dotenv';

config();

export const BrevoAxios = axios.create({
  baseURL: process.env.BREVO_TRANSACTION_EMAIL_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'api-key': process.env.BREVO_API_KEY,
  },
});

export async function MomoCallingHelper(path: string, requestBody: any) {
  const axiosInstant = axios.create({
    baseURL: process.env.MOMO_BASE_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
  });
  const response = await axiosInstant.post(path, requestBody);
  return response;
}
