import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { logger } from './logger';

// Get the encryption key from environment variables
// This should be a 32-byte key (for AES-256)
const getEncryptionKey = (): Buffer => {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (!envKey) {
    logger.warn('No ENCRYPTION_KEY environment variable found. Using development fallback key.');
    // Use a fallback key for development
    // In production, this should always be set in the environment
    return createHash('sha256')
      .update('development-fallback-encryption-key-do-not-use-in-production')
      .digest();
  }
  
  // If the key is provided as a hex string
  if (envKey.match(/^[0-9a-f]{64}$/i)) {
    return Buffer.from(envKey, 'hex');
  }
  
  // Otherwise, hash the key to get a 32-byte value
  return createHash('sha256').update(envKey).digest();
};

/**
 * Encrypt a string using AES-256-GCM
 * 
 * @param text - The plaintext to encrypt
 * @returns The encrypted text as a string (format: iv:authTag:ciphertext)
 */
export async function encrypt(text: string): Promise<string> {
  try {
    // Generate a random initialization vector
    const iv = randomBytes(16);
    
    // Get the encryption key
    const key = getEncryptionKey();
    
    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag (for GCM mode)
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return as iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string that was encrypted with AES-256-GCM
 * 
 * @param encryptedText - The encrypted text (format: iv:authTag:ciphertext)
 * @returns The decrypted plaintext
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    // Split the encrypted text into parts
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const [ivHex, authTagHex, ciphertext] = parts;
    
    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Get the encryption key
    const key = getEncryptionKey();
    
    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    
    // Set the auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the ciphertext
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to decrypt data');
  }
} 