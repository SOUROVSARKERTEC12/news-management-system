import { registerAs } from '@nestjs/config';
import { envVariables } from './env.schema';
import { configConstants } from './config.constants';

// Register the environment variables
export const envConfiguration = registerAs(
  configConstants.ENVIRONMENT,
  () => envVariables,
);
