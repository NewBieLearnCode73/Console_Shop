import * as fs from 'fs';
import * as readline from 'readline';
import { Readable } from 'stream';
import { decryptKeyGame, encryptKeyGame, hashKeyGame } from './crypto_helper';
import { KeyGame } from 'src/interfaces/keygamge';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
}

export async function processCsvFile(
  file: Express.Multer.File,
): Promise<KeyGame[]> {
  const keys: KeyGame[] = [];

  let inputStream: fs.ReadStream | Readable;
  if (file.path) {
    // Case: diskStorage
    inputStream = fs.createReadStream(file.path);
  } else if (file.buffer) {
    // Case: memoryStorage
    inputStream = Readable.from(file.buffer.toString());
  } else {
    throw new Error('Invalid file input: neither path nor buffer found');
  }

  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  const seenHashes = new Set<string>(); // check duplicate in csv file

  for await (const line of rl) {
    const key = line.trim();
    if (key) {
      const hash = hashKeyGame(key);

      if (seenHashes.has(hash)) {
        continue;
      }
      seenHashes.add(hash);

      const encrypted = encryptKeyGame(key);

      keys.push({ hash, encrypted });

      console.log(`Original: ${key} | Decrypted: ${decryptKeyGame(encrypted)}`);
    }
  }

  return keys;
}
