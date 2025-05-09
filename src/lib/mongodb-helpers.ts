import { ObjectId } from 'bson';

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
