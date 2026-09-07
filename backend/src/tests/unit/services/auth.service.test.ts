import { CreateUserDto } from "../../../dtos/auth/create-user.dto";
import { CustomError } from "../../../errors/CustomError";
import User from "../../../models/User";
import { IAuthRepository } from "../../../repositories/interfaces/auth.repository.interface";
import { AuthService } from "../../../services/auth.service";
import { IAuthService } from "../../../services/interfaces/auth.service.interface";
import { IEmailService } from "../../../services/interfaces/email.service.interface";
import { HashAdapter } from "../../../config/adapters/hash.adapter";
import { TokenGenerator } from "../../../config/adapters/token-generator.adapter";
import { JwtAdapter } from "../../../config/adapters/jwt.adapter";
import { LoginResponseDto } from "../../../dtos/auth/login-response.dto";
import RefreshToken from "../../../models/RefreshToken";
import { ForgotPasswordResponse } from "../../../dtos/auth/forgot-password-response.dto";
import { ResetPasswordDto } from "../../../dtos/auth/reset-password.dto";
import { CheckRecoveryTokenResponse } from "../../../dtos/auth/check-recovery-token-response.dto";

// mocks for static adapters used in the real authService
jest.mock("../../../config/adapters/hash.adapter");
jest.mock("../../../config/adapters/token-generator.adapter");
jest.mock("../../../config/adapters/jwt.adapter");

describe("AuthService", () => {
  let authRepositoryMock: jest.Mocked<IAuthRepository>;
  let emailServiceMock: jest.Mocked<IEmailService>;

  let authService: IAuthService;

  beforeEach(() => {
    authRepositoryMock = {
      createNewAccount: jest.fn(),
      deleteAllRefreshTokensByUserId: jest.fn(),
      deleteRefreshToken: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailOrUsername: jest.fn(),
      findRefreshTokensByUserId: jest.fn(),
      saveRefreshToken: jest.fn(),
      updateUserPassword: jest.fn(),
      validateUserAccount: jest.fn(),
      validationTokenExists: jest.fn(),
    };

    emailServiceMock = {
      sendEmail: jest.fn(),
    };

    authService = new AuthService(authRepositoryMock, emailServiceMock);
  });

  describe("createNewAccount", () => {
    const dto: CreateUserDto = {
      email: "test@test.com",
      firstName: "test",
      lastName: "test lastname",
      password: "rawpassword",
      username: "test",
    };

    it("should throw CustomError 400 when email is already registered", async () => {
      // Arrange
      authRepositoryMock.findByEmailOrUsername.mockResolvedValueOnce({
        email: dto.email,
        username: "otherusername",
      } as User);

      // Act & Assert
      await expect(authService.createNewAccount(dto)).rejects.toThrow(
        CustomError.badRequest("Email is already registered"),
      );
      expect(authRepositoryMock.findByEmailOrUsername).toHaveBeenCalledWith({
        email: dto.email,
        username: dto.username,
      });
      expect(authRepositoryMock.createNewAccount).not.toHaveBeenCalled();
    });
    //
    it("should throw CustomError 400 when username is already taken", async () => {
      // Arrange
      authRepositoryMock.findByEmailOrUsername.mockResolvedValueOnce({
        email: "other@test.com",
        username: dto.username,
      } as User);

      // Act & Assert
      await expect(authService.createNewAccount(dto)).rejects.toThrow(
        CustomError.badRequest("Username is already taken"),
      );
      expect(authRepositoryMock.createNewAccount).not.toHaveBeenCalled();
    });
    //
    it("should create user successfully, send verification email, and return mapped DTO", async () => {
      // Arrange
      const hashedPassword = "hashed_password_123";
      const generatedToken = "123456";

      const createdUserMock = {
        id: 1,
        email: dto.email,
        username: dto.username,
        validationToken: generatedToken,
        confirmed: false,
      } as User;

      authRepositoryMock.findByEmailOrUsername.mockResolvedValueOnce(null);

      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce(
        hashedPassword,
      );

      (TokenGenerator.generateNumericToken as jest.Mock).mockReturnValueOnce(
        generatedToken,
      );

      authRepositoryMock.createNewAccount.mockResolvedValueOnce(
        createdUserMock,
      );

      // mock service so it returns true
      emailServiceMock.sendEmail.mockResolvedValueOnce(true);

      // Act
      const result = await authService.createNewAccount(dto);

      // Assert
      expect(authRepositoryMock.findByEmailOrUsername).toHaveBeenCalledWith({
        email: dto.email,
        username: dto.username,
      });
      expect(HashAdapter.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(TokenGenerator.generateNumericToken).toHaveBeenCalled();
      expect(authRepositoryMock.createNewAccount).toHaveBeenCalledWith({
        ...dto,
        token: generatedToken,
        password: hashedPassword,
      });

      expect(result).toEqual({
        id: createdUserMock.id,
        email: createdUserMock.email,
        username: createdUserMock.username,
        confirmed: createdUserMock.confirmed,
      });
    });
    //
    it("should throw CustomError 500 if createNewAccount repository returns null", async () => {
      // Arrange
      authRepositoryMock.findByEmailOrUsername.mockResolvedValueOnce(null);
      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce("hashed");
      (TokenGenerator.generateNumericToken as jest.Mock).mockReturnValueOnce(
        "123456",
      );
      authRepositoryMock.createNewAccount.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.createNewAccount(dto)).rejects.toEqual(
        CustomError.internalServer("Error creating account. Try again later"),
      );
    });
    //
    it("should throw CustomError 500 when an unexpected exception occurs", async () => {
      // Arrange
      authRepositoryMock.findByEmailOrUsername.mockRejectedValueOnce(
        new Error("Unexpected DB crash"),
      );

      // Act & Assert
      await expect(authService.createNewAccount(dto)).rejects.toEqual(
        CustomError.internalServer("Error creating account. Try again later"),
      );
    });
  });
  //
  describe("AuthService - loginUser", () => {
    const loginData = {
      email: "test@test.com",
      password: "Password123!",
    };
    const mockUser = {
      id: 1,
      email: "test@test.com",
      username: "testuser",
      password: "hashed_password",
      confirmed: true,
    } as User;

    it("should throw CustomError 404 if user does not exist", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toEqual(
        CustomError.notFound(
          `User with email '${loginData.email}' does not exist`,
        ),
      );
      expect(authRepositoryMock.findByEmail).toHaveBeenCalledWith({
        email: loginData.email,
      });
    });
    //
    it("should throw CustomError 403 if account is not confirmed", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        confirmed: false,
      } as User);

      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toEqual(
        CustomError.forbidden("Account not verified"),
      );
    });
    //
    it("should throw CustomError 401 if password does not match", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockResolvedValueOnce(mockUser);
      (HashAdapter.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toEqual(
        CustomError.unAuthorized("Invalid credentials"),
      );
      expect(HashAdapter.compare).toHaveBeenCalledWith({
        password: loginData.password,
        hash: mockUser.password,
      });
    });
    //
    it("should throw CustomError 500 if token generation fails", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockResolvedValueOnce(mockUser);
      (HashAdapter.compare as jest.Mock).mockResolvedValueOnce(true);
      //mock methods called by method this.generateTokens()...
      (JwtAdapter.generateAccessToken as jest.Mock).mockResolvedValueOnce(null);
      (JwtAdapter.generateRefreshToken as jest.Mock).mockResolvedValueOnce(
        null,
      );

      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toEqual(
        CustomError.internalServer("Error creating authentication tokens"),
      );
    });
    //
    it("should throw CustomError 500 if token expiration date cannot be calculated", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockResolvedValueOnce(mockUser);
      (HashAdapter.compare as jest.Mock).mockResolvedValueOnce(true);

      //mock methods called by method this.generateTokens()...

      (JwtAdapter.generateAccessToken as jest.Mock).mockResolvedValueOnce(
        "access.token",
      );
      (JwtAdapter.generateRefreshToken as jest.Mock).mockResolvedValueOnce(
        "refresh.token",
      );

      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce(
        "hashed_refresh_token",
      );
      (JwtAdapter.getExpirationDate as jest.Mock).mockReturnValueOnce(null);

      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toEqual(
        CustomError.internalServer("Error calculating token expiration date"),
      );
    });
    //
    it("should successfully log in user, save refresh token, and send access notification email", async () => {
      // Arrange
      const accessToken = "valid.access.token";
      const refreshToken = "valid.refresh.token";
      const hashedRefreshToken = "hashed_refresh_token";
      const expirationDate = new Date();

      authRepositoryMock.findByEmail.mockResolvedValueOnce(mockUser);
      (HashAdapter.compare as jest.Mock).mockResolvedValueOnce(true);
      //mock methods called by method this.generateTokens()...
      (JwtAdapter.generateAccessToken as jest.Mock).mockResolvedValueOnce(
        accessToken,
      );
      (JwtAdapter.generateRefreshToken as jest.Mock).mockResolvedValueOnce(
        refreshToken,
      );
      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce(
        hashedRefreshToken,
      );
      (JwtAdapter.getExpirationDate as jest.Mock).mockReturnValueOnce(
        expirationDate,
      );
      authRepositoryMock.saveRefreshToken.mockResolvedValueOnce({} as any);

      // Act
      const result: LoginResponseDto = await authService.loginUser(loginData);

      // Assert
      expect(authRepositoryMock.findByEmail).toHaveBeenCalledWith({
        email: loginData.email,
      });
      expect(HashAdapter.compare).toHaveBeenCalledWith({
        password: loginData.password,
        hash: mockUser.password,
      });
      expect(JwtAdapter.generateAccessToken).toHaveBeenCalledWith({
        id: mockUser.id,
      });
      expect(JwtAdapter.generateRefreshToken).toHaveBeenCalledWith({
        id: mockUser.id,
      });
      expect(authRepositoryMock.saveRefreshToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        tokenHash: hashedRefreshToken,
        expiresAt: expirationDate,
      });
      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });
  //
  describe("renewAccessToken", () => {
    const rawRefreshToken = "valid.raw.refresh.token";
    const userId = 1;

    it("should throw CustomError 401 if refresh token is invalid or expired", async () => {
      // Arrange
      (JwtAdapter.validateRefreshToken as jest.Mock).mockResolvedValueOnce(
        null,
      );

      // Act & Assert
      await expect(
        authService.renewAccessToken(rawRefreshToken),
      ).rejects.toEqual(
        CustomError.unAuthorized("Invalid or expired refresh token"),
      );
      expect(JwtAdapter.validateRefreshToken).toHaveBeenCalledWith(
        rawRefreshToken,
      );
      expect(
        authRepositoryMock.findRefreshTokensByUserId,
      ).not.toHaveBeenCalled();
    });

    it("should throw CustomError 401 if no active sessions are found for user", async () => {
      // Arrange
      (JwtAdapter.validateRefreshToken as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      authRepositoryMock.findRefreshTokensByUserId.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        authService.renewAccessToken(rawRefreshToken),
      ).rejects.toEqual(
        CustomError.unAuthorized("Session not found or revoked"),
      );
      expect(authRepositoryMock.findRefreshTokensByUserId).toHaveBeenCalledWith(
        userId,
      );
    });

    it("should revoke all sessions and throw CustomError 401 if token does not match any active session (reused token detected)", async () => {
      // Arrange
      const activeSessions = [
        { id: 10, tokenHash: "hashed_token_1", userId },
        { id: 11, tokenHash: "hashed_token_2", userId },
      ] as any;

      (JwtAdapter.validateRefreshToken as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      authRepositoryMock.findRefreshTokensByUserId.mockResolvedValueOnce(
        activeSessions,
      );
      (HashAdapter.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        authService.renewAccessToken(rawRefreshToken),
      ).rejects.toEqual(
        CustomError.unAuthorized(
          "Security alert: Invalid or reused refresh token. Please login again.",
        ),
      );
      expect(
        authRepositoryMock.deleteAllRefreshTokensByUserId,
      ).toHaveBeenCalledWith(userId);
      expect(authRepositoryMock.deleteRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw CustomError 500 if generating new token pair fails", async () => {
      // Arrange
      const matchedSession = {
        id: 10,
        tokenHash: "matching_hash",
        userId,
      } as RefreshToken;

      (JwtAdapter.validateRefreshToken as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      authRepositoryMock.findRefreshTokensByUserId.mockResolvedValueOnce([
        matchedSession,
      ]);
      (HashAdapter.compare as jest.Mock).mockResolvedValueOnce(true);
      authRepositoryMock.deleteRefreshToken.mockResolvedValueOnce(true);

      (JwtAdapter.generateAccessToken as jest.Mock).mockResolvedValueOnce(null);
      (JwtAdapter.generateRefreshToken as jest.Mock).mockResolvedValueOnce(
        null,
      );

      // Act & Assert
      await expect(
        authService.renewAccessToken(rawRefreshToken),
      ).rejects.toEqual(
        CustomError.internalServer(
          "Error generating new authentication tokens",
        ),
      );
      expect(authRepositoryMock.deleteRefreshToken).toHaveBeenCalledWith(
        matchedSession.id,
      );
    });

    it("should successfully rotate refresh token, save new token, and return LoginResponseDto", async () => {
      // Arrange
      const matchedSession = {
        id: 10,
        tokenHash: "matching_hash",
        userId,
      } as RefreshToken;
      const newAccessToken = "new.access.token";
      const newRefreshToken = "new.refresh.token";
      const newHashedRefreshToken = "new_hashed_refresh_token";
      const expiresAt = new Date();

      (JwtAdapter.validateRefreshToken as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      authRepositoryMock.findRefreshTokensByUserId.mockResolvedValueOnce([
        matchedSession,
      ]);
      (HashAdapter.compare as jest.Mock).mockResolvedValueOnce(true);
      authRepositoryMock.deleteRefreshToken.mockResolvedValueOnce(true);

      (JwtAdapter.generateAccessToken as jest.Mock).mockResolvedValueOnce(
        newAccessToken,
      );
      (JwtAdapter.generateRefreshToken as jest.Mock).mockResolvedValueOnce(
        newRefreshToken,
      );
      (JwtAdapter.getExpirationDate as jest.Mock).mockReturnValueOnce(
        expiresAt,
      );
      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce(
        newHashedRefreshToken,
      );
      authRepositoryMock.saveRefreshToken.mockResolvedValueOnce(
        {} as RefreshToken,
      );

      // Act
      const result = await authService.renewAccessToken(rawRefreshToken);

      // Assert
      expect(authRepositoryMock.deleteRefreshToken).toHaveBeenCalledWith(
        matchedSession.id,
      );
      expect(JwtAdapter.generateAccessToken).toHaveBeenCalledWith({
        id: userId,
      });
      expect(JwtAdapter.generateRefreshToken).toHaveBeenCalledWith({
        id: userId,
      });
      expect(HashAdapter.hashPassword).toHaveBeenCalledWith(newRefreshToken);
      expect(authRepositoryMock.saveRefreshToken).toHaveBeenCalledWith({
        userId,
        tokenHash: newHashedRefreshToken,
        expiresAt,
      });
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  });
  //
  describe("generateTokens (private method)", () => {
    it("should generate both access and refresh tokens for a given userId", async () => {
      // Arrange
      const userId = 42;
      const mockAccessToken = "mock.access.jwt";
      const mockRefreshToken = "mock.refresh.jwt";

      (JwtAdapter.generateAccessToken as jest.Mock).mockResolvedValueOnce(
        mockAccessToken,
      );
      (JwtAdapter.generateRefreshToken as jest.Mock).mockResolvedValueOnce(
        mockRefreshToken,
      );

      // Act:
      const result = await (authService as any).generateTokens(userId);

      // Assert
      expect(JwtAdapter.generateAccessToken).toHaveBeenCalledWith({
        id: userId,
      });
      expect(JwtAdapter.generateRefreshToken).toHaveBeenCalledWith({
        id: userId,
      });
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });
  //
  describe("validateUser", () => {
    const validCode = "valid-confirmation-code-123";

    it("should throw CustomError 400 if user account confirmation fails", async () => {
      // Arrange
      authRepositoryMock.validateUserAccount.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(authService.validateUser(validCode)).rejects.toEqual(
        CustomError.badRequest(
          "The account was not confirmed. Make sure the code is valid.",
        ),
      );
      expect(authRepositoryMock.validateUserAccount).toHaveBeenCalledWith(
        validCode,
      );
    });

    it("should return true when the user account is successfully validated", async () => {
      // Arrange
      authRepositoryMock.validateUserAccount.mockResolvedValueOnce(true);

      // Act
      const result = await authService.validateUser(validCode);

      // Assert
      expect(authRepositoryMock.validateUserAccount).toHaveBeenCalledWith(
        validCode,
      );
      expect(result).toBe(true);
    });
  });
  //
  describe("forgotPassword", () => {
    const email = "user@example.com";

    const mockUserInstance = {
      id: 1,
      email: email,
      username: "testuser",
      validationToken: null as string | null,
      save: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw CustomError 403 if user does not exist", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toEqual(
        CustomError.forbidden("user does not exist"),
      );
      expect(authRepositoryMock.findByEmail).toHaveBeenCalledWith({ email });
    });

    it("should throw CustomError 500 and clear token if sending recovery email fails", async () => {
      // Arrange
      const generatedToken = "123456";
      authRepositoryMock.findByEmail.mockResolvedValueOnce(
        mockUserInstance as unknown as User,
      );
      (TokenGenerator.generateNumericToken as jest.Mock).mockReturnValueOnce(
        generatedToken,
      );

      // Mock sendRecoveryToken to emulate failed email delivery
      jest
        .spyOn(authService as any, "sendRecoveryToken")
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toEqual(
        CustomError.internalServer("Error sending recovery token email"),
      );

      expect(mockUserInstance.validationToken).toBeNull();
      expect(mockUserInstance.save).toHaveBeenCalledTimes(2); // Saved & later cleaned
    });

    it("should catch unexpected errors and rethrow as CustomError 500", async () => {
      // Arrange
      authRepositoryMock.findByEmail.mockRejectedValueOnce(
        new Error("Database connection lost"),
      );

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toEqual(
        CustomError.internalServer("Error creating recovery token"),
      );
    });

    it("should successfully generate token, save it, send email, and return ForgotPasswordResponse", async () => {
      // Arrange
      const generatedToken = "654321";
      authRepositoryMock.findByEmail.mockResolvedValueOnce(
        mockUserInstance as unknown as User,
      );
      (TokenGenerator.generateNumericToken as jest.Mock).mockReturnValueOnce(
        generatedToken,
      );

      jest
        .spyOn(authService as any, "sendRecoveryToken")
        .mockResolvedValueOnce(true);

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(TokenGenerator.generateNumericToken).toHaveBeenCalled();
      expect(mockUserInstance.validationToken).toBe(generatedToken);
      expect(mockUserInstance.save).toHaveBeenCalledTimes(1);
      expect((authService as any).sendRecoveryToken).toHaveBeenCalledWith({
        recipient: mockUserInstance.email,
        username: mockUserInstance.username,
        token: generatedToken,
      });
      expect(result).toEqual(
        new ForgotPasswordResponse(
          `Recovery token sent to: ${mockUserInstance.email}`,
        ),
      );
    });
  });
  //
  describe("updateUserPassword", () => {
    const resetPasswordDto: ResetPasswordDto = {
      email: "test@test.com",
      newPassword: "new-password-123",
      recoveryToken: "123456",
    };

    it("should successfully update the password and return CheckRecoveryTokenResponse", async () => {
      // Arrange
      const hashedPassword = "hashed_new_password";
      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce(
        hashedPassword,
      );
      authRepositoryMock.updateUserPassword.mockResolvedValueOnce(true);

      // Act
      const result = await authService.updateUserPassword(resetPasswordDto);

      // Assert
      expect(HashAdapter.hashPassword).toHaveBeenCalledWith(
        resetPasswordDto.newPassword,
      );
      expect(authRepositoryMock.updateUserPassword).toHaveBeenCalledWith({
        email: resetPasswordDto.email,
        passwordHash: hashedPassword,
        validationToken: resetPasswordDto.recoveryToken,
      });
      expect(result).toEqual(
        new CheckRecoveryTokenResponse("Password updated", true),
      );
    });

    it("should throw CustomError 500 if repository returns false", async () => {
      // Arrange
      (HashAdapter.hashPassword as jest.Mock).mockResolvedValueOnce(
        "hashed_password",
      );
      authRepositoryMock.updateUserPassword.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        authService.updateUserPassword(resetPasswordDto),
      ).rejects.toEqual(
        CustomError.internalServer(
          "Password could not be updated. Make sure the email and recoveryToken are valid",
        ),
      );
    });

    it("should catch unexpected errors and throw CustomError 500", async () => {
      // Arrange
      (HashAdapter.hashPassword as jest.Mock).mockRejectedValueOnce(
        new Error("BCrypt failure"),
      );

      // Act & Assert
      await expect(
        authService.updateUserPassword(resetPasswordDto),
      ).rejects.toEqual(CustomError.internalServer("Error updating password"));
    });
  });
  //
  describe("checkRecoveryToken", () => {
  const validToken = "123456";
  const invalidToken = "999999";

  it("should return CheckRecoveryTokenResponse when token exists", async () => {
    // Arrange
    authRepositoryMock.validationTokenExists.mockResolvedValueOnce(true);

    // Act
    const result = await authService.checkRecoveryToken(validToken);

    // Assert
    expect(authRepositoryMock.validationTokenExists).toHaveBeenCalledWith(validToken);
    expect(authRepositoryMock.validationTokenExists).toHaveBeenCalledTimes(1);
    expect(result).toEqual(new CheckRecoveryTokenResponse("Token exists", true));
  });

  it("should throw CustomError 404 when token does not exist", async () => {
    // Arrange
    authRepositoryMock.validationTokenExists.mockResolvedValueOnce(false);

    // Act & Assert
    await expect(authService.checkRecoveryToken(invalidToken)).rejects.toEqual(
      CustomError.notFound("Token does not exist")
    );
    expect(authRepositoryMock.validationTokenExists).toHaveBeenCalledWith(invalidToken);
  });

  it("should catch unexpected errors and rethrow as CustomError 500", async () => {
    // Arrange
    authRepositoryMock.validationTokenExists.mockRejectedValueOnce(
      new Error("Database failure")
    );

    // Act & Assert
    await expect(authService.checkRecoveryToken(validToken)).rejects.toEqual(
      CustomError.internalServer("Error validating token")
    );
  });
});
});
