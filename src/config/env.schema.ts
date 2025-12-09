import { z } from 'zod';
import * as dotenv from 'dotenv';
import { DevelopmentTypeEnum } from '../common/enums';

dotenv.config({
  path: '.env',
});

// 🔹 Reusable validators
const numericString = z
  .string()
  .regex(/^\d+$/, { message: 'Must be a number string' });
const nonEmptyString = z.string().nonempty();

// 🔹 Main environment schema
export const environmentSchema = z.object({
  NODE_ENV: z
    .enum([...Object.values(DevelopmentTypeEnum)])
    .default(DevelopmentTypeEnum.DEVELOPMENT),
  PORT: numericString.transform(Number).default(5000),
  DATABASE_USERNAME: nonEmptyString,
  DATABASE_PASSWORD: nonEmptyString,
  DATABASE_NAME: nonEmptyString,
  DATABASE_HOST: nonEmptyString,
  DATABASE_PORT: numericString.transform(Number).default(5432),
  DATABASE_DIALECT: z.enum(['mysql']).default('mysql'),
});

// ✅ Parse & validate environment
const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid environment configuration:');
  console.error(parsed.error.message);
  // Force immediate exit with non-zero code
  process.exitCode = 1;
  throw new Error('Invalid environment variables. See logs above.');
}

export const envVariables = parsed.data;
