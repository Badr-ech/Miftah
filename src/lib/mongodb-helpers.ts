import { ObjectId } from 'bson';
import crypto from 'crypto';

/**
 * Utility functions for working with MongoDB in the application
 */

/**
 * Converts a string to a valid MongoDB ObjectId
 * If the string is already a valid ObjectId, it returns the string
 * Otherwise, it creates a new ObjectId
 */
export function toObjectId(id: string): string {
  try {
    // Check if the string is already a valid ObjectId
    if (ObjectId.isValid(id)) {
      return id;
    }
  } catch (error) {
    console.error('Invalid ObjectId:', error);
  }
  
  // If not valid, create a new ObjectId
  return new ObjectId().toHexString();
}

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  try {
    return ObjectId.isValid(id);
  } catch (error) {
    return false;
  }
}

/**
 * Converts any string ID to a MongoDB ObjectId string format
 * Useful when migrating from other ID formats
 */
export function ensureObjectId(id: string | undefined | null): string | null {
  if (!id) return null;
  return isValidObjectId(id) ? id : toObjectId(id);
}

/**
 * Converts a UUID format string (with hyphens) to a MongoDB ObjectId
 * This is useful for migrating from PostgreSQL UUID to MongoDB ObjectID
 * 
 * @param uuid UUID string with hyphens (e.g., a75b842b-5a56-4153-ac7d-6917fe5cb3cc)
 * @returns A valid MongoDB ObjectId string or null if conversion fails
 */
export function uuidToObjectId(uuid: string): string | null {
  if (!uuid) return null;
  
  try {
    // Check if it's already a valid ObjectId (24 hex chars)
    if (ObjectId.isValid(uuid) && uuid.length === 24) {
      return uuid;
    }
    
    // If it's a UUID with hyphens
    if (uuid.includes('-')) {
      console.log(`Converting UUID format to ObjectId: ${uuid}`);
      
      // For the specific error case you're seeing, we need to handle this case specially
      // Error: Malformed ObjectID: invalid character '-' was found at index 8
      
      // Remove all hyphens and take first 24 chars (MongoDB ObjectIDs are 24 hex chars)
      const hexString = uuid.replace(/-/g, '').substring(0, 24);
      
      // Ensure it's valid
      if (ObjectId.isValid(hexString)) {
        return hexString;
      }
    }
    
    // If all conversions fail, generate a new consistent ObjectId based on the UUID
    // This ensures the same UUID always converts to the same ObjectId
    const hash = crypto.createHash('md5').update(uuid).digest('hex').substring(0, 24);
    if (ObjectId.isValid(hash)) {
      return hash;
    }
    
    // Last resort: create a completely new ObjectId
    return new ObjectId().toHexString();
  } catch (error) {
    console.error('Error converting UUID to ObjectId:', error);
    return new ObjectId().toHexString();
  }
}
