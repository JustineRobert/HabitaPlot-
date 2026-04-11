/**
 * Auth utility tests
 */

const {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword
} = require('../../../src/utils/auth');

describe('Auth Utils', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    process.env.JWT_EXPIRE = '1h';
    process.env.JWT_REFRESH_EXPIRE = '2h';
  });

  it('should generate and verify JWT tokens', () => {
    const payload = { userId: 'user-123', role: 'user' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).toMatchObject(payload);
  });

  it('should return null for invalid JWT tokens', () => {
    const decoded = verifyToken('invalid.token.value');
    expect(decoded).toBeNull();
  });

  it('should generate and verify refresh tokens', () => {
    const payload = { userId: 'user-123' };
    const token = generateRefreshToken(payload);

    expect(typeof token).toBe('string');

    const decoded = verifyRefreshToken(token);
    expect(decoded).toMatchObject(payload);
  });

  it('should hash and compare passwords successfully', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/);

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);
  });

  it('should fail password comparison on mismatch', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);

    const isMatch = await comparePassword('WrongPassword', hash);
    expect(isMatch).toBe(false);
  });
});
