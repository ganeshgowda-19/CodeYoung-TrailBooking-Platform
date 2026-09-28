import { z } from 'zod';

/**
 * Strict Email Validator Function
 * Enforces valid email structure and specific domain suffix rules (e.g. gmail must end with @gmail.com)
 */
export const validateStrictEmail = (email: string): { isValid: boolean; message?: string } => {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, message: 'Email address is required' };
  }

  // Basic email structure regex
  const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicEmailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. user@gmail.com)' };
  }

  // Domain specific checks
  const atIndex = trimmed.indexOf('@');
  if (atIndex !== -1) {
    const domainPart = trimmed.slice(atIndex + 1);

    // Gmail domain check and typo catch (gmal, gmil, gmaill, gmail.co, etc.)
    if (
      domainPart.startsWith('gmal') ||
      domainPart.startsWith('gmil') ||
      domainPart.startsWith('gmaill') ||
      domainPart.includes('gmail')
    ) {
      if (domainPart !== 'gmail.com') {
        return { isValid: false, message: 'Gmail address must end with @gmail.com (e.g. user@gmail.com)' };
      }
    }

    // Yahoo check
    if (domainPart.startsWith('yaho') || domainPart.includes('yahoo')) {
      if (!domainPart.startsWith('yahoo.com') && !domainPart.startsWith('yahoo.co')) {
        return { isValid: false, message: 'Yahoo email address must end with @yahoo.com' };
      }
    }

    // Outlook / Hotmail check
    if (domainPart.startsWith('outlok') || domainPart.includes('outlook')) {
      if (!domainPart.startsWith('outlook.com') && !domainPart.startsWith('outlook.co')) {
        return { isValid: false, message: 'Outlook email address must end with @outlook.com' };
      }
    }
  }

  return { isValid: true };
};

/**
 * Strict Name Validator Function
 * Enforces letters and spaces only, no pure numbers or special symbols
 */
export const validateStrictName = (name: string): { isValid: boolean; message?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, message: 'Name is required' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  // Allow alphabetic characters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, message: 'Name must contain letters only (no numbers or special symbols)' };
  }

  return { isValid: true };
};

/**
 * Zod Custom Email Schema
 */
export const strictEmailZodSchema = z.string().superRefine((val, ctx) => {
  const res = validateStrictEmail(val);
  if (!res.isValid && res.message) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: res.message,
    });
  }
});

/**
 * Zod Custom Name Schema
 */
export const strictNameZodSchema = z.string().superRefine((val, ctx) => {
  const res = validateStrictName(val);
  if (!res.isValid && res.message) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: res.message,
    });
  }
});
