import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a secure random token for invitations
 * @returns A unique token string
 */
export const generateToken = (): string => {
  // Generate a UUID
  const uuid = uuidv4();
  
  // Create a browser-compatible hash alternative
  // Combine UUID with timestamp and random values
  const timestamp = Date.now().toString();
  const randomVal = Math.random().toString(36).substring(2);
  
  // Combine and create a string that's still sufficiently random
  const combined = uuid + timestamp + randomVal;
  
  // Create a simple hash-like string by manipulating the combined string
  let hashLike = '';
  for (let i = 0; i < combined.length; i++) {
    hashLike += combined.charCodeAt(i).toString(16);
  }
  
  // Return a portion of the hash-like string (first 32 characters)
  return hashLike.substring(0, 32);
};

/**
 * Validate a token format
 * @param token The token to validate
 * @returns Boolean indicating if the token format is valid
 */
export const isValidTokenFormat = (token: string): boolean => {
  // Check if token is a 32-character hexadecimal string
  return /^[0-9a-f]{32}$/i.test(token);
};
