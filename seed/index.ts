/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { parseSeedArgs } from './seed-args';
import * as fs from 'fs';
import * as path from 'path';

const { target, amount, clear } = parseSeedArgs();

const filePath = path.join(__dirname, `${target}.ts`);
if (!fs.existsSync(filePath)) {
  console.error(`❌ Seed file for "${target}" not found!`);
  process.exit(1);
}

// Truyền option xuống file seed
require(filePath).bootstrap(amount, clear);
