// TODO: Finish testing for auth module

import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/auth.controller";
import { IAuthService } from "../../../services/interfaces/auth.service.interface";
import { CreatedAccountResponseDto } from "../../../dtos/auth/created-account-response.dto";
import { CustomError } from "../../../errors/CustomError";
import { LoginRequest } from "../../../types/auth/LoginRequest";
import { LoginResponseDto } from "../../../dtos/auth/login-response.dto";
import { VerifyCodeRequest } from "../../../types/auth/VerifyCodeRequest";
import { ForgotPasswordResponse } from "../../../dtos/auth/forgot-password-response.dto";
import { CheckRecoveryTokenResponse } from "../../../dtos/auth/check-recovery-token-response.dto";
import { CheckRecoveryTokenRequest } from "../../../types/auth/CheckRecoveryTokenRequest";

describe("AuthController", () => {
  let authServiceMock: jest.Mocked<IAuthService>;
  let authController: AuthController;

  beforeEach(() => {
    authServiceMock = {
      createNewAccount: jest.fn(),
      checkRecoveryToken: jest.fn(),
      forgotPassword: jest.fn(),
      loginUser: jest.fn(),
      renewAccessToken: jest.fn(),
      updateUserPassword: jest.fn(),
      validateUser: jest.fn(),
    };

    authController = new AuthController(authServiceMock);
  });

  describe("createAccount", () => {
    it("should responde with a 201 TypedResponse and a CreatedAccountResponseDto", async () => {
      const body = {
        firstName: "testname",
        lastName: "testlastname",
        username: "testusername",
        email: "test@test.com",
        password: "raw-password-test",
      };

      const req = createRequest({
        url: "/api/v1/auth/create-account",
        method: "POST",
        body,
      });
      const res = createResponse();

      const returnValue: CreatedAccountResponseDto = {
        email: body.email,
        confirmed: false,
        id: 1,
        username: body.username,
      };

      authServiceMock.createNewAccount.mockResolvedValueOnce(returnValue);

      await authController.createAccount(req, res);
      expect(authServiceMock.createNewAccount).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(201);
      const response = res._getJSONData();
      expect(response).toEqual({
        ok: true,
        code: 201,
        data: {
          email: body.email,
          confirmed: false,
          id: 1,
          username: body.username,
        },
        message: "Account created successfully",
      });
    });
    //
    it("should responde with a 400 CustomError if any of the fields is invalid or missing", async () => {
      const body = {
        firstName: "testname",
        lastName: "testlastname",
        username: "testusername",
        email: "invalid-email",
        password: "raw-password-test",
      };

      const req = createRequest({
        url: "/api/v1/auth/create-account",
        method: "POST",
        body,
      });
      const res = createResponse();

      await authController.createAccount(req, res);
      expect(authServiceMock.createNewAccount).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 400,
        error: "email must be a valid email address",
      });
    });
    //
    it("should responde with a CustomError when the IAuthService throws", async () => {
      const body = {
        firstName: "testname",
        lastName: "testlastname",
        username: "testusername",
        email: "test@test.com",
        password: "raw-password-test",
      };
      const req = createRequest({
        url: "/api/v1/auth/create-account",
        method: "POST",
        body,
      });
      const res = createResponse();

      authServiceMock.createNewAccount.mockRejectedValueOnce(
        CustomError.internalServer("Something unexpected happened"),
      );
      await authController.createAccount(req, res);
      expect(authServiceMock.createNewAccount).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(500);
      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 500,
        error: "Something unexpected happened",
      });
    });
  });
  //
  describe("loginAccount", () => {
    //check login success
    it("should responde with a LoginResponseDto on successful login", async () => {
      const body = {
        email: "testemail@gmail.com",
        password: "rawpassword",
      };
      const req = createRequest({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      });
      const res = createResponse();
      const returnValue = new LoginResponseDto("a1b2c3", "a1b2c3d4");

      authServiceMock.loginUser.mockResolvedValueOnce(returnValue);
      await authController.loginAccount(req as unknown as LoginRequest, res);
      expect(authServiceMock.loginUser).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        ok: true,
        code: 200,
        data: { accessToken: "a1b2c3", refreshToken: "a1b2c3d4" },
      });
    });
    // check dto failed validation
    it("should responde with a CustomError on invalid or missing data", async () => {
      const body = {
        // email: "testemail@gmail.com", //missing email
        password: "rawpassword",
      };
      const req = createRequest({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      });
      const res = createResponse();

      await authController.loginAccount(req as unknown as LoginRequest, res);
      expect(res.statusCode).toBe(400);
      expect(authServiceMock.loginUser).not.toHaveBeenCalled();
      expect(res._getJSONData()).toEqual({
        ok: false,
        code: 400,
        error: "email is required and must be a non-empty string",
      });
    });
    // check unexpected error thrown by the authService
    it("should responde with a CustomError when AuthService throws", async () => {
      const body = {
        email: "testemail@gmail.com",
        password: "rawpassword",
      };
      const req = createRequest({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      });
      const res = createResponse();

      authServiceMock.loginUser.mockRejectedValueOnce(
        CustomError.internalServer("Unexpected server error."),
      );
      await authController.loginAccount(req as unknown as LoginRequest, res);
      expect(authServiceMock.loginUser).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        ok: false,
        code: 500,
        error: "Unexpected server error.",
      });
    });
  });
  //
  describe("renewAccessToken", () => {
    it("should respond with 200 and LoginResponseDto when a valid token is provided", async () => {
      // Arrange
      const token = "valid.refresh.token";
      const req = createRequest({
        url: "/api/v1/auth/renew-token",
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = createResponse();
      const expectedResponse = new LoginResponseDto(
        "new.access.token",
        "new.refresh.token",
      );
      authServiceMock.renewAccessToken.mockResolvedValueOnce(expectedResponse);
      // Act
      await authController.renewAccessToken(req, res);

      // Assert
      expect(authServiceMock.renewAccessToken).toHaveBeenCalledWith(token);
      expect(authServiceMock.renewAccessToken).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: true,
        code: 200,
        data: expectedResponse,
      });
    });

    it("should handle CustomError when authorization header is missing", async () => {
      // Arrange
      const req = createRequest({
        url: "/api/v1/auth/renew-token",
        method: "POST",
        // no auth header
      });
      const res = createResponse();

      // Act
      await authController.renewAccessToken(req, res);

      // Assert
      expect(authServiceMock.renewAccessToken).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 401,
        error: "jwt not included",
      });
    });

    it("should handle CustomError thrown by authService.renewAccessToken", async () => {
      // Arrange
      const token = "expired.or.invalid.token";
      const req = createRequest({
        url: "/api/v1/auth/renew-token",
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = createResponse();

      authServiceMock.renewAccessToken.mockRejectedValueOnce(
        CustomError.unAuthorized("Invalid refresh token"),
      );

      // Act
      await authController.renewAccessToken(req, res);

      // Assert
      expect(authServiceMock.renewAccessToken).toHaveBeenCalledWith(token);
      expect(res.statusCode).toBe(401);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 401,
        error: "Invalid refresh token",
      });
    });
  });
  //
  describe("confirmAccount", () => {
    it("should respond with 200 and success message when verification code is valid", async () => {
      // Arrange
      const code = "123456";
      const req = createRequest({
        url: "/api/v1/auth/confirm-account",
        method: "POST",
        // emulate property code attached to the request by middleware
        code,
      }) as VerifyCodeRequest;
      const res = createResponse();
      authServiceMock.validateUser.mockResolvedValueOnce(true);

      // Act
      await authController.confirmAccount(req, res);
      // Assert
      expect(authServiceMock.validateUser).toHaveBeenCalledWith(code);
      expect(authServiceMock.validateUser).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: true,
        code: 200,
        message: "Account verified",
      });
    });

    it("should handle CustomError when code is invalid or expired", async () => {
      // Arrange
      const invalidCode = "000000";
      const req = createRequest({
        url: "/api/v1/auth/confirm-account",
        method: "POST",
        code: invalidCode,
      }) as VerifyCodeRequest;
      const res = createResponse();

      authServiceMock.validateUser.mockRejectedValueOnce(
        CustomError.badRequest("Invalid or expired verification code"),
      );

      // Act
      await authController.confirmAccount(req, res);

      // Assert
      expect(authServiceMock.validateUser).toHaveBeenCalledWith(invalidCode);
      expect(res.statusCode).toBe(400);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 400,
        error: "Invalid or expired verification code",
      });
    });
  });
  //
  describe("forgotPassword", () => {
    it("should respond with 200 and ForgotPasswordResponse when email is valid", async () => {
      // Arrange
      const body = {
        email: "test@test.com",
      };

      const req = createRequest({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        body,
      });
      const res = createResponse();

      const serviceResponse = new ForgotPasswordResponse(
        "Password reset token sent to email",
      );

      authServiceMock.forgotPassword.mockResolvedValueOnce(serviceResponse);

      // Act
      await authController.forgotPassword(req, res);

      // Assert
      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(body.email);
      expect(authServiceMock.forgotPassword).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: true,
        code: 200,
        data: serviceResponse,
      });
    });

    it("should handle error when body validation fails in ForgotPasswordDto", async () => {
      // Arrange
      const invalidBody = {
        email: "invalid-email-format",
      };

      const req = createRequest({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        body: invalidBody,
      });
      const res = createResponse();

      // Act
      await authController.forgotPassword(req, res);

      // Assert
      expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);

      const response = res._getJSONData();
      expect(response.ok).toBe(false);
      expect(response.code).toBe(400);
      expect(response.error).toBeDefined();
    });

    it("should handle CustomError thrown by authService.forgotPassword when user is not found", async () => {
      // Arrange
      const body = {
        email: "notfound@test.com",
      };

      const req = createRequest({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        body,
      });
      const res = createResponse();

      authServiceMock.forgotPassword.mockRejectedValueOnce(
        CustomError.notFound("User not found with provided email"),
      );

      // Act
      await authController.forgotPassword(req, res);

      // Assert
      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(body.email);
      expect(res.statusCode).toBe(404);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 404,
        error: "User not found with provided email",
      });
    });
  });
  //
  describe("checkRecoveryToken", () => {
    it("should respond with 200 and CheckRecoveryTokenResponse when token is valid", async () => {
      // Arrange
      const recoveryToken = "valid.recovery.token";
      const req = createRequest({
        url: "/api/v1/auth/check-recovery-token",
        method: "POST",
        recoveryToken,
      }) as CheckRecoveryTokenRequest;
      const res = createResponse();

      const serviceResponse = new CheckRecoveryTokenResponse(
        "Token is valid",
        true,
      );

      authServiceMock.checkRecoveryToken.mockResolvedValueOnce(serviceResponse);

      // Act
      await authController.checkRecoveryToken(req, res);

      // Assert
      expect(authServiceMock.checkRecoveryToken).toHaveBeenCalledWith(
        recoveryToken,
      );
      expect(authServiceMock.checkRecoveryToken).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: true,
        code: 200,
        data: serviceResponse,
      });
    });

    it("should handle CustomError when recovery token is invalid or expired", async () => {
      // Arrange
      const invalidToken = "invalid.or.expired.token";
      const req = createRequest({
        url: "/api/v1/auth/check-recovery-token",
        method: "POST",
        recoveryToken: invalidToken,
      }) as CheckRecoveryTokenRequest;
      const res = createResponse();

      authServiceMock.checkRecoveryToken.mockRejectedValueOnce(
        CustomError.unAuthorized("Invalid or expired recovery token"),
      );

      // Act
      await authController.checkRecoveryToken(req, res);

      // Assert
      expect(authServiceMock.checkRecoveryToken).toHaveBeenCalledWith(
        invalidToken,
      );
      expect(res.statusCode).toBe(401);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 401,
        error: "Invalid or expired recovery token",
      });
    });
  });
  //
  describe("resetPassword", () => {
    it("should respond with 200 and CheckRecoveryTokenResponse when request body is valid", async () => {
      // Arrange
      const body = {
        email: "test@test.com",
        newPassword: "new-password-123",
        recoveryToken: "123456",
      };

      const req = createRequest({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        body,
      });
      const res = createResponse();

      const serviceResponse = new CheckRecoveryTokenResponse(
        "Password updated successfully",
        true,
      );

       authServiceMock.updateUserPassword.mockResolvedValueOnce(serviceResponse);

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(authServiceMock.updateUserPassword).toHaveBeenCalledTimes(1);
      expect(authServiceMock.updateUserPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: body.email,
          newPassword: body.newPassword,
          recoveryToken: body.recoveryToken,
        }),
      );
      expect(res.statusCode).toBe(200);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: true,
        code: 200,
        data: serviceResponse,
      });
    });

    it("should handle error when body validation fails in ResetPasswordDto", async () => {
      // Arrange
      const invalidBody = {
        email: "test@test.com",
        newPassword: "123", // very short password
        recoveryToken: "123456"
      };

      const req = createRequest({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        body: invalidBody,
      });
      const res = createResponse();

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(authServiceMock.updateUserPassword).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);

      const response = res._getJSONData();
      expect(response.ok).toBe(false);
      expect(response.code).toBe(400);
      expect(response.error).toBeDefined();
    });

    it("should handle CustomError thrown by authService.updateUserPassword", async () => {
      // Arrange
      const body = {
        email: "test@test.com",
        newPassword: "new-password-123",
        recoveryToken: "123456",
      };

      const req = createRequest({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        body,
      });
      const res = createResponse();

      authServiceMock.updateUserPassword.mockRejectedValueOnce(
        CustomError.badRequest("Invalid or expired recovery token"),
      );

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(authServiceMock.updateUserPassword).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(400);

      const response = res._getJSONData();
      expect(response).toEqual({
        ok: false,
        code: 400,
        error: "Invalid or expired recovery token",
      });
    });
  });
});
