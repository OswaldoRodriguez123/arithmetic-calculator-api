import jwt from 'jsonwebtoken';
import { envString, envNumber } from '@/config/env';

// The HMAC secret comes from the environment, never from source. Loading this
// module without JWT_SECRET is a hard failure (fail-fast at startup).
const SECRET = (() => {
  const secret = envString('JWT_SECRET', '');
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. See example.env.');
  }
  return secret;
})();

// Optional previous secret, only consulted during rotation: tokens signed
// before a redeploy stay valid until they expire naturally.
const PREVIOUS_SECRET = envString('JWT_SECRET_PREVIOUS', '');
const KID = envString('JWT_KID', 'v1');
const ALGORITHM: jwt.Algorithm = 'HS256';

export const EXPIRATION_TIME = envNumber('JWT_EXPIRATION_SECONDS', 3600) // en segundos

export interface TokenData {
  id?: string;
  name?: string;
  exp?: string;
  iat?: string;
}

export const createToken = (data: TokenData) => {

  try {
    delete data.exp
    delete data.iat
    const token = jwt.sign(data, SECRET, { expiresIn: EXPIRATION_TIME, algorithm: ALGORITHM, keyid: KID })

    return token

  } catch (error) {
    throw new Error('Token data could not be created')
  }
}

export const verifyToken = (token: string) => {
  const options: jwt.VerifyOptions = { algorithms: [ALGORITHM] };
  try {
    return jwt.verify(token, SECRET, options);
  } catch (error) {
    if (PREVIOUS_SECRET) {
      try {
        return jwt.verify(token, PREVIOUS_SECRET, options);
      } catch (previousError) {
        // fall through to the generic error below
      }
    }
    throw new Error('Token could not be verified')
  }
}
