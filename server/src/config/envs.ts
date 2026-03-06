import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
    PORT: get('PORT').required().asPortNumber(),
    ORIGINS: get('ORIGINS').required().asString(),
    ONNX_INTRA_THREADS: get('ONNX_INTRA_THREADS').default(2).asIntPositive(),
    ONNX_INTER_THREADS: get('ONNX_INTER_THREADS').default(1).asIntPositive(),
};
