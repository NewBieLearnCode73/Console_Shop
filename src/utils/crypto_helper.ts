import { config } from 'dotenv';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

const DIGITAL_KEY_AES = configService.getOrThrow<string>('DIGITAL_KEY_AES');
const DIGITAL_KEY_SHA256 =
  configService.getOrThrow<string>('DIGITAL_KEY_SHA256');

// Hashers and Encryptors for Digital Key
export function hashKeyGame(keyGame: string): string {
  return CryptoJS.HmacSHA256(keyGame, DIGITAL_KEY_SHA256).toString();
}

export function encryptKeyGame(keyGame: string): string {
  return CryptoJS.AES.encrypt(keyGame, DIGITAL_KEY_AES).toString();
}

export function decryptKeyGame(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, DIGITAL_KEY_AES);
  return bytes.toString(CryptoJS.enc.Utf8);
}
