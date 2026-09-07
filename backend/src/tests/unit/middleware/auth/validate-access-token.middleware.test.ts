import type { NextFunction, Request, Response } from "express";
import { ValidateJWT } from "../../../../middleware/auth/validate-access-token.middleware";
import { JwtAdapter } from "../../../../config/adapters/jwt.adapter";
import { AuthenticatedRequest } from "../../../../types/auth/AuthenticatedRequest";
import { createRequest, createResponse } from "node-mocks-http";
import { UserJwtPayload } from "../../../../types/auth/UserJwtPayload";

// Mock the class JwtAdapter
jest.mock("../../../../config/adapters/jwt.adapter");

describe("ValidateJWT Middleware", () => {
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should attach userId to req and call next() when valid Bearer token is provided", async () => {
    // Arrange
    const validToken = "valid.jwt.token";
    const payload: UserJwtPayload = { id: 1, exp: 1232434, iat: 1211212 };

    const mockRequest = {
      header: jest.fn().mockReturnValue(`Bearer ${validToken}`),
    };

    const mockedRes = {
      status: jest.fn(),
    };

    (JwtAdapter.validateAccessToken as jest.Mock).mockResolvedValueOnce(
      payload,
    );

    // Act
    await ValidateJWT.validateAccessToken(
      mockRequest as unknown as Request,
      mockedRes as unknown as Response,
      nextFunction,
    );

    // Assert
    expect(mockRequest.header).toHaveBeenCalledWith("Authorization");
    expect(JwtAdapter.validateAccessToken).toHaveBeenCalledWith(validToken);
    expect((mockRequest as unknown as AuthenticatedRequest).userId).toBe(
      payload.id,
    );
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockedRes.status).not.toHaveBeenCalled();
  });
  //
  it("should respond with 401 if no Authorization header is provided", async () => {
    // Arrange
    const mockRequest = {
      header: jest.fn().mockReturnValue(undefined),
    };

    const mockedRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Act
    await ValidateJWT.validateAccessToken(
      mockRequest as unknown as Request,
      mockedRes as unknown as Response,
      nextFunction,
    );

    // Assert
    expect(mockRequest.header).toHaveBeenCalledWith("Authorization");
    expect(mockedRes.status).toHaveBeenCalledWith(401);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "No token provided",
      ok: false,
      code: 401,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should respond with 401 if Authorization header does not start with 'Bearer '", async () => {
    // Arrange
    const mockRequest = {
      header: jest.fn().mockReturnValue("Basic invalid_format_token"),
    };

    const mockedRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Act
    await ValidateJWT.validateAccessToken(
      mockRequest as unknown as Request,
      mockedRes as unknown as Response,
      nextFunction,
    );

    // Assert
    expect(mockRequest.header).toHaveBeenCalledWith("Authorization");
    expect(mockedRes.status).toHaveBeenCalledWith(401);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Invalid Bearer token format",
      ok: false,
      code: 401,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should respond with 401 if JwtAdapter returns null (invalid or expired token)", async () => {
    // Arrange
    const invalidToken = "invalid.jwt.token";

    const mockRequest = {
      header: jest.fn().mockReturnValue(`Bearer ${invalidToken}`),
    };

    const mockedRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (JwtAdapter.validateAccessToken as jest.Mock).mockResolvedValueOnce(null);

    // Act
    await ValidateJWT.validateAccessToken(
      mockRequest as unknown as Request,
      mockedRes as unknown as Response,
      nextFunction,
    );

    // Assert
    expect(mockRequest.header).toHaveBeenCalledWith("Authorization");
    expect(JwtAdapter.validateAccessToken).toHaveBeenCalledWith(invalidToken);
    expect(mockedRes.status).toHaveBeenCalledWith(401);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired access token",
      ok: false,
      code: 401,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should respond with 500 when an unhandled error occurs during validation", async () => {
    // Arrange
    const token = "some.jwt.token";

    const mockRequest = {
      header: jest.fn().mockReturnValue(`Bearer ${token}`),
    };

    const mockedRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (JwtAdapter.validateAccessToken as jest.Mock).mockRejectedValueOnce(
      new Error("Unexpected error"),
    );

    // Act
    await ValidateJWT.validateAccessToken(
      mockRequest as unknown as Request,
      mockedRes as unknown as Response,
      nextFunction,
    );

    // Assert
    expect(mockedRes.status).toHaveBeenCalledWith(500);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
      ok: false,
      code: 500,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
