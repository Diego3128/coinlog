import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { environments } from "../envs/envs";

export class JwtAdapter {
  private static readonly JWT_SECRET = environments.JWT_SECRET;
  private static readonly REFRESH_SECRET = environments.REFRESH_SECRET;

  /**
   * Creates refresh token with a default duration of 5 days
   * @param payload Object to save in the JWT
   * @param duration
   */
  static async generateRefreshToken(
    payload: Record<string, any>,
    duration: SignOptions["expiresIn"] = "5d",
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        this.REFRESH_SECRET,
        { expiresIn: duration },
        (err, token) => {
          if (err || !token) return resolve(null);
          resolve(token);
        },
      );
    });
  }

  static async validateRefreshToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, this.REFRESH_SECRET, (err, decoded) => {
        if (err || !decoded) return resolve(null);
        resolve(decoded as T);
      });
    });
  }

  /**
   * Creates an access token with a default duration of 1h
   * @param payload Object to save in the JWT
   * @param duration
   */
  static async generateAccessToken(
    payload: Record<string, any>,
    duration: SignOptions["expiresIn"] = "15m",
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        this.JWT_SECRET,
        { expiresIn: duration },
        (err, token) => {
          if (err || !token) return resolve(null);
          resolve(token);
        },
      );
    });
  }

  static async validateAccessToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, this.JWT_SECRET, (err, decoded) => {
        if (err || !decoded) return resolve(null);
        resolve(decoded as T);
      });
    });
  }

  // En JwtAdapter.ts:
  static getExpirationDate(token: string): Date | null {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000); //convert s to ms
  }
}
