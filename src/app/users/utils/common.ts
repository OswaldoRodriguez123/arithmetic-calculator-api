import bcrypt from "bcryptjs";

export const compareHash = (password: string, hash: string) => {

  const result = bcrypt.compareSync(password, hash)

  return result
}