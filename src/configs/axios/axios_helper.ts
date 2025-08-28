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
