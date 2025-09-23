// Validation utilities for authentication forms
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push("Email is required");
  } else {
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address");
    }
    if (email.length > 100) {
      errors.push("Email address is too long");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Password validation for registration
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (password.length > 100) {
      errors.push("Password is too long");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    if (/\s/.test(password)) {
      errors.push("Password cannot contain spaces");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Password confirmation validation
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  const errors: string[] = [];
  
  if (!confirmPassword) {
    errors.push("Password confirmation is required");
  } else if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Name validation
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name) {
    errors.push("Full name is required");
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.push("Full name must be at least 2 characters long");
    }
    if (trimmedName.length > 50) {
      errors.push("Full name is too long");
    }
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
      errors.push("Full name can only contain letters, spaces, hyphens, and apostrophes");
    }
    // Check that it's not just spaces
    if (trimmedName.length === 0) {
      errors.push("Full name cannot be empty");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Login password validation (simpler - just check if provided)
export function validateLoginPassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push("Password is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize input to prevent common issues (preserve passwords exactly)
export function sanitizeInput(input: string, preserveSpaces = false): string {
  return preserveSpaces ? input : input.trim();
}

// Email canonicalization for consistency
export function canonicalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Complete registration form validation
export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  errors: {
    name: string[];
    email: string[];
    password: string[];
    confirmPassword: string[];
    general: string[];
  };
}

export function validateRegistrationForm(data: RegistrationFormData): RegistrationValidationResult {
  const nameValidation = validateName(data.name);
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  const confirmPasswordValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
  
  const isValid = nameValidation.isValid && 
                  emailValidation.isValid && 
                  passwordValidation.isValid && 
                  confirmPasswordValidation.isValid;
  
  return {
    isValid,
    errors: {
      name: nameValidation.errors,
      email: emailValidation.errors,
      password: passwordValidation.errors,
      confirmPassword: confirmPasswordValidation.errors,
      general: []
    }
  };
}

// Complete login form validation
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginValidationResult {
  isValid: boolean;
  errors: {
    email: string[];
    password: string[];
    general: string[];
  };
}

export function validateLoginForm(data: LoginFormData): LoginValidationResult {
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validateLoginPassword(data.password);
  
  const isValid = emailValidation.isValid && passwordValidation.isValid;
  
  return {
    isValid,
    errors: {
      email: emailValidation.errors,
      password: passwordValidation.errors,
      general: []
    }
  };
}