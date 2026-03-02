import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
    PORT: get('PORT').required().asPortNumber(),
    ORIGINS: get('ORIGINS').required().asString(),
};
