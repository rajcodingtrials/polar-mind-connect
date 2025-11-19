
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { validatePassword } from '@/utils/passwordValidation';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const secureSignUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    age: number
  ) => {
    setIsLoading(true);
    
    try {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast.error('Password does not meet security requirements');
        return { error: new Error('Weak password') };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return { error: new Error('Invalid email') };
      }

      // Validate first name
      if (!firstName.trim() || firstName.length < 2) {
        toast.error('First name must be at least 2 characters long');
        return { error: new Error('Invalid first name') };
      }

      // Validate last name
      if (!lastName.trim() || lastName.length < 2) {
        toast.error('Last name must be at least 2 characters long');
        return { error: new Error('Invalid last name') };
      }

      if (age < 1 || age > 120) {
        toast.error('Please enter a valid age');
        return { error: new Error('Invalid age') };
      }

      const result = await auth.signUp(email, password, firstName, lastName, age);
      
      if (result.error) {
        toast.error(result.error.message || 'Sign up failed');
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
      
      return result;
    } catch (error) {
      console.error('Secure sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return { error: new Error('Invalid email') };
      }

      if (!password.trim()) {
        toast.error('Password is required');
        return { error: new Error('Password required') };
      }

      const result = await auth.signIn(email, password);
      
      if (result.error) {
        // Enhanced error handling for common auth errors
        let errorMessage = 'Sign in failed';
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (result.error.message?.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a moment before trying again.';
        }
        
        toast.error(errorMessage);
      } else {
        toast.success('Signed in successfully!');
      }
      
      return result;
    } catch (error) {
      console.error('Secure sign in error:', error);
      toast.error('An unexpected error occurred during sign in');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const secureResetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return { error: new Error('Invalid email') };
      }

      const result = await auth.resetPassword(email);
      
      if (result.error) {
        toast.error('Failed to send password reset email. Please try again.');
      } else {
        toast.success('Password reset email sent! Please check your inbox.');
      }
      
      return result;
    } catch (error) {
      console.error('Secure password reset error:', error);
      toast.error('An unexpected error occurred during password reset');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...auth,
    secureSignUp,
    secureSignIn,
    secureResetPassword,
    isLoading
  };
};
