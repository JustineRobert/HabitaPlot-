/**
 * Authentication controller unit tests
 */

jest.mock('../../../src/models/User');
jest.mock('../../../src/utils/auth');

const User = require('../../../src/models/User');
const {
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  verifyRefreshToken
} = require('../../../src/utils/auth');
const authController = require('../../../src/controllers/authController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns validation error when registering with missing fields', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = createResponse();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ValidationError' }));
  });

  it('returns conflict when user already exists during registration', async () => {
    User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });
    const req = { body: { email: 'test@example.com', password: 'Password123', name: 'Test User' } };
    const res = createResponse();

    await authController.register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ConflictError' }));
  });

  it('registers a new user and returns tokens', async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue('hashed-password');
    User.create.mockResolvedValue({ id: 10, email: 'test@example.com', name: 'Test User', role: 'user' });
    generateToken.mockReturnValue('jwt-token');
    generateRefreshToken.mockReturnValue('refresh-token');

    const req = {
      body: { email: 'test@example.com', password: 'Password123', name: 'Test User', phone: '256700000000' }
    };
    const res = createResponse();

    await authController.register(req, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com', passwordHash: 'hashed-password', name: 'Test User', role: 'user' }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'jwt-token', refreshToken: 'refresh-token' }));
  });

  it('returns validation error when login request is missing fields', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = createResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ValidationError' }));
  });

  it('returns authentication error when login credentials are invalid', async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { email: 'test@example.com', password: 'wrong-password' } };
    const res = createResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'AuthenticationError' }));
  });

  it('returns authentication error when password is incorrect', async () => {
    User.findOne.mockResolvedValue({ id: 5, email: 'test@example.com', name: 'Test', role: 'user', passwordHash: 'hash', isActive: true, save: jest.fn() });
    comparePassword.mockResolvedValue(false);
    const req = { body: { email: 'test@example.com', password: 'wrong-password' } };
    const res = createResponse();

    await authController.login(req, res);

    expect(comparePassword).toHaveBeenCalledWith('wrong-password', 'hash');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'AuthenticationError' }));
  });

  it('logs in an active user and returns tokens', async () => {
    const saveMock = jest.fn();
    User.findOne.mockResolvedValue({ id: 5, email: 'test@example.com', name: 'Test', role: 'user', passwordHash: 'hash', isActive: true, save: saveMock });
    comparePassword.mockResolvedValue(true);
    generateToken.mockReturnValue('jwt-token');
    generateRefreshToken.mockReturnValue('refresh-token');

    const req = { body: { email: 'test@example.com', password: 'Password123' } };
    const res = createResponse();

    await authController.login(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'jwt-token', refreshToken: 'refresh-token' }));
  });

  it('returns validation error when refresh token is missing', async () => {
    const req = { body: {} };
    const res = createResponse();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ValidationError' }));
  });

  it('returns authentication error when refresh token is invalid', async () => {
    verifyRefreshToken.mockReturnValue(null);
    const req = { body: { refreshToken: 'invalid' } };
    const res = createResponse();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'AuthenticationError' }));
  });

  it('refreshes token for valid refresh token', async () => {
    verifyRefreshToken.mockReturnValue({ userId: 5 });
    User.findByPk.mockResolvedValue({ id: 5, email: 'test@example.com', name: 'Test', role: 'user', isActive: true });
    generateToken.mockReturnValue('refreshed-jwt');

    const req = { body: { refreshToken: 'valid-refresh-token' } };
    const res = createResponse();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'refreshed-jwt' });
  });

  it('returns not found when current user does not exist', async () => {
    User.findByPk.mockResolvedValue(null);
    const req = { user: { userId: 10 } };
    const res = createResponse();

    await authController.getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'NotFoundError' }));
  });

  it('returns current user when found', async () => {
    const user = { id: 10, email: 'test@example.com', name: 'Test', role: 'user', attributes: { exclude: ['passwordHash'] } };
    User.findByPk.mockResolvedValue(user);
    const req = { user: { userId: 10 } };
    const res = createResponse();

    await authController.getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });
});
