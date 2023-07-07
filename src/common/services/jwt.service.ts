import jwt from 'jsonwebtoken';

const SECRET = '$2a$10$x9MeCXnRG4B.g4tYXL1szO3cNX8xysaYThZZ7jHAWkTEGUMo0.aGK'
export const EXPIRATION_TIME = 3600 // en segundos

interface TokenData {
  id?: string;
  name?: string;
  exp?: string;
  iat?: string;
}

export const createToken = (data: TokenData) => {

  try {
    delete data.exp
    delete data.iat
    const token = jwt.sign(data, SECRET, { expiresIn: EXPIRATION_TIME })

    return token

  } catch (error) {
    throw new Error('Token data could not be created')
  }
}

export const verifyToken = (token: string) => {

  try {
    let data = jwt.verify(token, SECRET);

    return data

  } catch (error) {
    throw new Error('Token could not be verified')
  }
}