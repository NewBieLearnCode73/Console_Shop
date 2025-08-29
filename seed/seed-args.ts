export interface SeedOptions {
  target: string;
  amount: number;
  clear: boolean;
}

export function parseSeedArgs(defaultAmount = 10): SeedOptions {
  const rawArgs = process.argv.slice(2); // ['user', '20', 'clear']

  console.log('🔍 Raw Args:', rawArgs);

  const target = rawArgs[0];
  if (!target) {
    console.error('❌ Missing target. Example: npm run seed -- user 20 clear');
    process.exit(1);
  }

  // lấy số
  const amountArg = rawArgs.find((arg) => /^\d+$/.test(arg));
  const amount = amountArg ? parseInt(amountArg, 10) : defaultAmount;

  // có chữ "clear" thì hiểu là true
  const clear = rawArgs.includes('clear');

  console.log('🎯 Target:', target);
  console.log('🔢 Amount:', amount);
  console.log('🧹 Clear:', clear);

  return { target, amount, clear };
}
