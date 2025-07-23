"use client";

import { useUser } from '@clerk/nextjs';
import { GlobalCursor } from './global-cursor';

export function CursorWrapper() {
  const { user } = useUser();
  
  // Extract first name from user data
  const getFirstName = () => {
    if (!user) return "Guest";
    
    // Try to get first name from firstName field
    if (user.firstName) {
      return user.firstName;
    }
    
    // If no firstName, try to extract from fullName
    if (user.fullName) {
      return user.fullName.split(' ')[0];
    }
    
    // If no name available, try username
    if (user.username) {
      return user.username;
    }
    
    // Fallback
    return "User";
  };

  return <GlobalCursor userName={getFirstName()} />;
}
