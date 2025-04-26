import { Request, Response } from "express";
import { AuthController } from "./controller";
import { UserService } from "../user/service";
import { AuthService } from "./service";

// Mock dependencies
jest.mock("../user/service");
jest.mock("./service");

describe("AuthController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      userId: 1,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: "test@example.com",
        fullName: "Test User",
      };
      const mockToken = "mock-token";

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      };

      (UserService.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserService.create as jest.Mock).mockResolvedValue(mockUser);
      (AuthService.generateToken as jest.Mock).mockReturnValue(mockToken);
      (AuthService.sanitizeUser as jest.Mock).mockReturnValue(mockUser);

      // Act
      await AuthController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(UserService.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(UserService.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
        role: "user",
      });
      expect(AuthService.generateToken).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        token: mockToken,
        user: mockUser,
      });
    });

    it("should return 409 if user already exists", async () => {
      // Arrange
      mockRequest.body = {
        email: "existing@example.com",
        password: "password123",
        fullName: "Existing User",
      };

      (UserService.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

      // Act
      await expect(
        AuthController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow("User already exists");
    });
  });

  // Add more tests for login, getCurrentUser, etc.
});
