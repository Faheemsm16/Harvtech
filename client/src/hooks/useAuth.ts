import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from 'react';

export function useAuth() {
  // Simplified auth for development - always return authenticated user
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading then authenticate
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const mockUser = {
    id: 'dev-user-id-123',
    name: 'Demo User',
    email: 'demo@harvtech.com',
    firstName: 'Demo',
    lastName: 'User',
    profileImageUrl: null,
    mobileNumber: '9876543210',
    role: 'user',
    farmerId: 'FARM001',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    aadharNumber: '123456789012',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    user: mockUser,
    isLoading,
    isAuthenticated: true,
  };
}
