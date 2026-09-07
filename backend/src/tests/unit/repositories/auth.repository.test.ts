import { Sequelize } from "sequelize-typescript";
import { IAuthRepository } from "../../../repositories/interfaces/auth.repository.interface";
import Budget from "../../../models/Budget";
import Expense from "../../../models/Expense";
import User from "../../../models/User";
import RefreshToken from "../../../models/RefreshToken";
import { AuthRepository } from "../../../repositories/auth.repository";

describe("AuthRepository (Integration)", () => {
  let testSequelize: Sequelize;
  let authRepository: IAuthRepository;
  let user: User;

  // Connect to in memory database before all tests & create all tables (required for relationships)
  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [Budget, Expense, User, RefreshToken],
    });

    await testSequelize.sync({ force: true });
    authRepository = new AuthRepository();
  });

  beforeEach(async () => {
    //create a user for the foreign relationship
    user = await User.create({
      firstName: "test",
      lastName: "test lastname",
      username: "test",
      email: "test@gmail.com",
      password: "hashedpass",
      confirmed: true,
    });
  });

  // clean  all used tables after each test
  afterEach(async () => {
    await Budget.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  // close connection when all tests have finished
  afterAll(async () => {
    await testSequelize.close();
  });

  describe("findRefreshTokensByUserId", () => {
    it("should return an array of refresh tokens belonging to the given user", async () => {
      // Arrange
      await RefreshToken.create({
        userId: user.id,
        tokenHash: "token_hash_1",
        expiresAt: new Date(),
      });
      await RefreshToken.create({
        userId: user.id,
        tokenHash: "token_hash_2",
        expiresAt: new Date(),
      });

      // Act
      const results = await authRepository.findRefreshTokensByUserId(user.id);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].userId).toBe(user.id);
      expect(results[1].userId).toBe(user.id);
    });

    it("should return an empty array if no refresh tokens exist for the given user", async () => {
      // Act
      const results = await authRepository.findRefreshTokensByUserId(9999);

      // Assert
      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });
  });

  describe("deleteRefreshToken", () => {
    it("should delete the specified refresh token by id and return true", async () => {
      // Arrange
      const createdToken = await RefreshToken.create({
        userId: user.id,
        tokenHash: "token_hash_to_delete",
        expiresAt: new Date(),
      });

      // Act
      const result = await authRepository.deleteRefreshToken(createdToken.id);

      // Assert
      expect(result).toBe(true);

      const foundInDb = await RefreshToken.findByPk(createdToken.id);
      expect(foundInDb).toBeNull();
    });

    it("should return false when trying to delete a non-existent token", async () => {
      // Act
      const result = await authRepository.deleteRefreshToken(9999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("deleteAllRefreshTokensByUserId", () => {
    it("should delete all refresh tokens associated with a userId and return true", async () => {
      // Arrange
      await RefreshToken.create({
        userId: user.id,
        tokenHash: "hash_1",
        expiresAt: new Date(),
      });
      await RefreshToken.create({
        userId: user.id,
        tokenHash: "hash_2",
        expiresAt: new Date(),
      });

      // Act
      const result = await authRepository.deleteAllRefreshTokensByUserId(
        user.id,
      );

      // Assert
      expect(result).toBe(true);

      const remainingTokens = await RefreshToken.findAll({
        where: { userId: user.id },
      });
      expect(remainingTokens).toHaveLength(0);
    });

    it("should return false if no refresh tokens were found to delete for the userId", async () => {
      // Act
      const result = await authRepository.deleteAllRefreshTokensByUserId(9999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findByEmail", () => {
    it("should return the user instance when matching email is found", async () => {
      // Act
      const foundUser = await authRepository.findByEmail({ email: user.email });

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe(user.email);
    });

    it("should return null if no user matches the email", async () => {
      // Act
      const foundUser = await authRepository.findByEmail({
        email: "nonexistent@gmail.com",
      });

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  describe("createNewAccount", () => {
    it("should persist and return a new User record with validationToken", async () => {
      // Arrange
      const createData = {
        firstName: "Carlos",
        lastName: "Gomez",
        username: "carlosg",
        email: "carlos@example.com",
        password: "hashedpassword123",
        token: "verification_token_123",
      };

      // Act
      const newUser = await authRepository.createNewAccount(createData);

      // Assert
      expect(newUser).toBeDefined();
      expect(newUser.id).toBeDefined();
      expect(newUser.email).toBe(createData.email);
      expect(newUser.username).toBe(createData.username);
      expect(newUser.validationToken).toBe(createData.token);
      expect(newUser.confirmed).toBe(false);

      // Check if it was saved
      const userInDb = await User.findByPk(newUser.id);
      expect(userInDb).not.toBeNull();
      expect(userInDb?.email).toBe(createData.email);
    });
  });

  describe("validateUserAccount", () => {
    it("should confirm user account, clear validationToken, and return true when valid code is provided", async () => {
      // Arrange
      const token = "valid_confirmation_code";
      const unconfirmedUser = await User.create({
        firstName: "Ana",
        lastName: "Perez",
        username: "anap",
        email: "ana@example.com",
        password: "hashedpassword",
        validationToken: token,
        confirmed: false,
      });

      // Act
      const result = await authRepository.validateUserAccount(token);

      // Assert
      expect(result).toBe(true);

      const updatedUser = await User.findByPk(unconfirmedUser.id);
      expect(updatedUser?.confirmed).toBe(true);
      expect(updatedUser?.validationToken).toBeNull();
    });

    it("should return null if no user matches the validation code", async () => {
      // Act
      const result =
        await authRepository.validateUserAccount("invalid_token_code");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("validationTokenExists", () => {
    it("should return true if a user exists with the given validationToken", async () => {
      // Arrange
      const token = "recovery_token_123";
      await User.create({
        firstName: "Laura",
        lastName: "Gomez",
        username: "laurag",
        email: "laura@example.com",
        password: "hashedpassword",
        validationToken: token,
      });

      // Act
      const exists = await authRepository.validationTokenExists(token);

      // Assert
      expect(exists).toBe(true);
    });

    it("should return false if no user exists with the given validationToken", async () => {
      // Act
      const exists =
        await authRepository.validationTokenExists("non_existent_token");

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe("updateUserPassword", () => {
    it("should update user password, clear validationToken, and return true when matching email and validationToken exist", async () => {
      // Arrange
      const token = "valid_reset_token";
      const oldPassword = "old_hashed_password";
      const newPasswordHash = "new_hashed_password_456";

      const targetUser = await User.create({
        firstName: "Maria",
        lastName: "Lopez",
        username: "marial",
        email: "maria@example.com",
        password: oldPassword,
        validationToken: token,
      });

      // Act
      const result = await authRepository.updateUserPassword({
        email: targetUser.email,
        validationToken: token,
        passwordHash: newPasswordHash,
      });

      // Assert
      expect(result).toBe(true);

      const updatedUser = await User.findByPk(targetUser.id);
      expect(updatedUser?.password).toBe(newPasswordHash);
      expect(updatedUser?.validationToken).toBeNull();
    });

    it("should return false if email and validationToken combination does not match any user", async () => {
      // Act
      const result = await authRepository.updateUserPassword({
        email: user.email,
        validationToken: "wrong_token",
        passwordHash: "new_password_hash",
      });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findByEmailOrUsername", () => {
    it("should return user when matching email is found", async () => {
      // Act
      const result = await authRepository.findByEmailOrUsername({
        email: user.email,
        username: "nonexistent_username",
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    it("should return user when matching username is found", async () => {
      // Act
      const result = await authRepository.findByEmailOrUsername({
        email: "nonexistent_email@test.com",
        username: user.username,
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(user.id);
      expect(result?.username).toBe(user.username);
    });

    it("should return null if neither email nor username matches", async () => {
      // Act
      const result = await authRepository.findByEmailOrUsername({
        email: "nonexistent_email@test.com",
        username: "nonexistent_username",
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
