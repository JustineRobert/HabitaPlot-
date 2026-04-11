# Security Guidelines & Best Practices

## Overview

Security is built into HabitaPlot™ from the ground up. This document outlines security best practices, implementation guidelines, and security checklist items.

## Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users and services have minimum required permissions
3. **Secure by Default**: Security features are enabled by default
4. **Input Validation**: All inputs are validated on both client and server
5. **Output Encoding**: All outputs are properly encoded
6. **Fail Securely**: Error messages don't leak sensitive information

---

## Authentication & Authorization

### Password Security

```javascript
// ✅ CORRECT: Strong password hashing
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  // 12 rounds of salting for strong hashing
  const hash = await bcrypt.hash(password, 12);
  return hash;
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// ❌ INCORRECT: Storing plain text
export const registerUser = (email, password) => {
  User.create({ email, password }); // Never do this!
};
```

### Password Requirements

```
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, and symbols
- No dictionary words
- Not previously breached (check against haveibeenpwned.com)
- Enforce change on first login
- No reuse of last 5 passwords
```

### JWT Token Management

```javascript
// ✅ CORRECT: Secure token implementation
import jwt from 'jsonwebtoken';

const generateToken = (userId, expiresIn = '1h') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn,
      algorithm: 'HS256'
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// ✅ CORRECT: Refresh token rotation
const refreshAccessToken = (refreshToken) => {
  const decoded = verifyToken(refreshToken, process.env.REFRESH_SECRET);
  
  // Issue new tokens
  return {
    accessToken: generateToken(decoded.userId, '1h'),
    refreshToken: generateToken(decoded.userId, '7d', process.env.REFRESH_SECRET)
  };
};
```

### Token Storage

```javascript
// ✅ CORRECT: HttpOnly secure cookies (most secure)
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000 // 1 hour
});

// ⚠️ ACCEPTABLE: localStorage (if XSS protections in place)
localStorage.setItem('token', token);

// ❌ NEVER: Use sessionStorage with sensitive tokens
sessionStorage.setItem('token', token); // Vulnerable to XSS
```

### Role-Based Access Control (RBAC)

```javascript
// ✅ CORRECT: Middleware-based RBAC
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }
    
    next();
  };
};

// Usage
router.delete('/listings/:id', 
  authMiddleware,
  ownershipMiddleware, // Verify ownership
  listingController.deleteListing
);

router.post('/admin/approve-listing',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.approveListing
);
```

---

## Data Protection

### Sensitive Data Handling

```javascript
// ❌ INCORRECT: Exposing sensitive data
export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId);
  return user; // Returns password hash!
};

// ✅ CORRECT: Excluding sensitive fields
export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ['passwordHash', 'emailVerificationToken', 'phoneVerificationToken']
    }
  });
  return user;
};

// ✅ BETTER: Explicit whitelist
export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'email', 'name', 'avatar_url', 'bio', 'role']
  });
  return user;
};
```

### Data Encryption

```javascript
// ✅ CORRECT: Encrypt sensitive data at rest
const crypto = require('crypto');

const encryptData = (data, encryptionKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptData = (encryptedData, encryptionKey) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

### GDPR Compliance

```javascript
// ✅ CORRECT: User data management
export const getUserData = async (userId) => {
  // Return all user's personal data
  const user = await User.findByPk(userId);
  const listings = await Listing.findAll({ where: { userId } });
  const messages = await Message.findAll({ where: { userId } });
  
  return {
    user,
    listings,
    messages
  };
};

export const deleteUserData = async (userId) => {
  // Implement right to be forgotten
  await sequelize.transaction(async (t) => {
    // Soft delete user data
    await User.destroy({ where: { id: userId }, transaction: t });
    await Listing.destroy({ where: { userId }, transaction: t });
    await Message.destroy({ where: { userId }, transaction: t });
    
    // Log deletion for audit
    await AuditLog.create({
      userId,
      action: 'USER_DELETED',
      timestamp: new Date()
    }, { transaction: t });
  });
};
```

---

## Input Validation & Sanitization

### Validation

```javascript
// ✅ CORRECT: Input validation middleware
const { body, validationResult } = require('express-validator');

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  body('name')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Usage
router.post('/register', 
  validateRegister, 
  handleValidationErrors,
  authController.register
);
```

### Sanitization

```javascript
// ✅ CORRECT: Sanitizing inputs
const xss = require('xss');

export const cleanUserInput = (data) => {
  return {
    name: xss(data.name),
    bio: xss(data.bio, {
      whiteList: ['b', 'i', 'em', 'strong'],
      stripIgnoredTag: true
    }),
    email: data.email.toLowerCase().trim()
  };
};

// ❌ INCORRECT: Using user input directly in queries
const searchTerm = req.query.search;
const results = await Listing.findAll({
  where: {
    title: sequelize.literal(`LIKE '%${searchTerm}%'`)
  }
}); // SQL injection vulnerability!

// ✅ CORRECT: Using Sequelize operators
const { Op } = require('sequelize');
const results = await Listing.findAll({
  where: {
    title: { [Op.iLike]: `%${searchTerm}%` }
  }
});
```

---

## API Security

### Rate Limiting

```javascript
// ✅ CORRECT: Implement rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'auth-limit:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter limit for auth endpoints
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.post('/auth/login', authLimiter, authController.login);
app.post('/auth/register', authLimiter, authController.register);
```

### CORS Configuration

```javascript
// ✅ CORRECT: Strict CORS policy
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Specific domain
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ❌ INCORRECT: Allow all origins
app.use(cors()); // Wildcard origin is dangerous!
```

### Security Headers

```javascript
// ✅ CORRECT: Enable security headers with Helmet
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", process.env.API_URL]
  }
}));
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));
```

### Nginx Security Headers

```nginx
# ✅ CORRECT: Frontend Nginx security headers (nginx.conf)
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy
  "default-src 'self'; 
   script-src 'self' 'nonce-{random}'; 
   style-src 'self' 'unsafe-inline'; 
   img-src 'self' data: https:;
   font-src 'self';
   connect-src 'self' https://api.example.com;"
  always;
```

---

## Environment & Secrets

### Environment Variables

```bash
# ✅ CORRECT: .env file structure
NODE_ENV=production
PORT=5000

# Database
DB_HOST=prod-db.rds.amazonaws.com
DB_PORT=5432
DB_USER=dbuser
DB_PASSWORD=strong_password_123
DB_NAME=habitaplot_prod

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_very_long_random_secret_key_here
REFRESH_SECRET=your_different_long_random_secret_key
JWT_EXPIRATION=1h

# Redis
REDIS_URL=redis://secure-redis:6379

# AWS
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=habitaplot-prod-files

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...

# Email
SENDGRID_API_KEY=SG.your_api_key_here

# Front-end
FRONTEND_URL=https://habitaplot.com
API_URL=https://api.habitaplot.com
```

### Secrets Management

```javascript
// ✅ CORRECT: AWS Secrets Manager
import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();

export const getSecret = async (secretName) => {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Failed to retrieve secret:', error);
    throw error;
  }
};

// Usage
const dbPassword = await getSecret('prod/rds/password');
```

---

## Logging & Monitoring

### Secure Logging

```javascript
// ✅ CORRECT: Secure logging without sensitive data
const logger = require('./utils/logger');

export const login = async (req, res, next) => {
  try {
    logger.info('Login attempt', {
      email: maskEmail(req.body.email), // Masked
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // Don't log passwords!
    const user = await User.findOne({ 
      where: { email: req.body.email } 
    });

    logger.info('Login successful', {
      userId: user.id,
      email: maskEmail(user.email)
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      // Skip stack trace in production
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// Utility function to mask email
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};
```

### Error Handling

```javascript
// ✅ CORRECT: Safe error responses
export const globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  
  // Safe error response
  const response = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: error.stack 
    })
  };

  // Never expose internal details in production
  if (process.env.NODE_ENV !== 'production') {
    response.details = error;
  }

  res.status(statusCode).json(response);
};

// ❌ INCORRECT: Leaking stack traces
res.status(500).json({
  error: error.message,
  stack: error.stack, // Exposes system architecture!
  query: req.query     // Exposes internal implementation
});
```

---

## File Upload Security

### Safe File Upload

```javascript
// ✅ CORRECT: Secure file upload
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Keep in memory
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedMimes.includes(file.mimetype) || 
        !allowedExts.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    
    cb(null, true);
  }
});

export const uploadListingImage = [
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Scan for malware (optional but recommended)
      const isSafe = await scanForMalware(req.file.buffer);
      if (!isSafe) {
        return res.status(400).json({ error: 'File failed security scan' });
      }

      // Optimize image
      const optimized = await optimizeImage(req.file.buffer);

      // Generate unique filename
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;

      // Upload to S3
      const url = await uploadToS3(optimized, filename);

      res.json({ url });
    } catch (error) {
      next(error);
    }
  }
];

// ❌ INCORRECT: Trusting user filenames
const unsafeUpload = multer({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // User controls filename!
  }
});
```

---

## Database Security

### Prepared Statements

```javascript
// ✅ CORRECT: Using Sequelize (prevents SQL injection)
const listings = await Listing.findAll({
  where: {
    city: 'New York'
  }
});

// With parameters
const listings = await Listing.findAll({
  where: {
    price: { [Op.gte]: minPrice, [Op.lte]: maxPrice }
  }
});

// ❌ INCORRECT: String interpolation in raw queries
const city = req.query.city;
const listings = await sequelize.query(
  `SELECT * FROM listings WHERE city = '${city}'` // SQL injection!
);
```

### Database Access Control

```sql
-- Create limited privilege user
CREATE USER app_user WITH PASSWORD 'strong_password';

-- Grant minimal permissions
GRANT CONNECT ON DATABASE habitaplot TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;

-- Deny delete/alter for safety
REVOKE DELETE, ALTER ON ALL TABLES FROM app_user;
```

---

## Security Checklist

### Development

- [ ] No secrets in code
- [ ] Password hashing with bcryptjs (12+ rounds)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use ORM)
- [ ] XSS protection (sanitize outputs)
- [ ] CSRF tokens for state-changing operations
- [ ] Secure session management
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting implemented

### Deployment

- [ ] Environment variables properly set
- [ ] Secrets in AWS Secrets Manager
- [ ] Database backups encrypted
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules restrictive
- [ ] Access logs enabled
- [ ] Monitoring and alerting active
- [ ] Penetration testing performed
- [ ] Security headers verified
- [ ] API rate limiting active

### Ongoing

- [ ] Dependencies updated regularly
- [ ] Security patches applied immediately
- [ ] Access logs reviewed weekly
- [ ] Audit logs retained
- [ ] Incident response plan in place
- [ ] Regular security audits scheduled
- [ ] Team security training current
- [ ] Vulnerability scanning enabled
- [ ] Data encryption verified
- [ ] Backup restoration tested

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. **Email**: security@habitaplot.com
3. **Include**:
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will:
- Acknowledge within 24 hours
- Provide timeline to fix
- Credit discoverer (if desired)
- Release security patch

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)
- [GDPR Compliance](https://gdpr-info.eu/)

---

**Last Updated**: January 2024  
**Version**: 1.0
