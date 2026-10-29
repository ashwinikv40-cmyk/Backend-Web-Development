
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 12;

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register({ name, email, password }) {
  if (
    !validateNonEmptyString(name) ||
    !validateNonEmptyString(email) ||
    !validateNonEmptyString(password)
  ) {
    throw new AuthError(400, 'INVALID_INPUT', 'Name, email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AuthError(409, 'EMAIL_EXISTS', 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await userRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return safeUser(user);
  } catch (error) {
    // Handle concurrent registration attempts for the same email.
    if (error.code === 'P2002') {
      throw new AuthError(409, 'EMAIL_EXISTS', 'Email already exists');
    }
    throw error;
  }
}

async function login({ email, password }) {
  if (
    !validateNonEmptyString(email) ||
    !validateNonEmptyString(password)
  ) {
    throw new AuthError(400, 'INVALID_INPUT', 'Email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    // Perform a dummy comparison to reduce timing differences.
    await bcrypt.compare(
      password,
      '$2b$12$C6UzMDM.H6dfI/f/IKcEe.4W3j3t6g8u6Y1u8mQeJ2gX5Y0H3jW2K'
    );
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return safeUser(user);
}

module.exports = {
  AuthError,
  register,
  login,
};
