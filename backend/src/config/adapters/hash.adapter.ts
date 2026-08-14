import bcryptjs from "bcryptjs";

export class HashAdapter {
  private static readonly SALT_ROUNDS = 10;

  static hashPassword = async (password: string): Promise<string> => {
    return await bcryptjs.hash(password, HashAdapter.SALT_ROUNDS);
  };

  static compare = async ({
    password,
    hash,
  }: {
    password: string;
    hash: string;
  }): Promise<boolean> => {
    return await bcryptjs.compare(password, hash);
  };
}
