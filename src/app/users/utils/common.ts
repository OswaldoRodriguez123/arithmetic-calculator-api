import bcrypt from "bcryptjs";

// Bcrypt hash of a random throwaway password. Used on the unknown-user login
// path so it costs the same as the known-user path (timing-attack mitigation).
export const DECOY_HASH = '$2a$10$BcfCbGfH0yyCbQVngb/HXuJcVUZYGVSWT0KaCaJUxQOKoMnhWq4pm';

export const compareHash = (password: string, hash: string) => {
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }

  const result = bcrypt.compareSync(password, hash)

  return result
}
