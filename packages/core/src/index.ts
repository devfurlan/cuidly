/**
 * @cuidly/core - Core business logic, types, and validation schemas
 *
 * This package provides centralized definitions for:
 * - Subscription plans, pricing, billing
 * - Validation schemas (Zod)
 * - Brazilian validators (CPF, CNPJ, CEP, phone, etc.)
 * - Content moderation utilities
 * - Location/geographic types
 * - Constants and options for forms
 * - Matching algorithm types and utilities
 */

// Subscriptions
export * from './subscriptions';

// Schemas
export * from './schemas';

// Validators
export * from './validators';

// Types
export * from './types';

// Constants
export * from './constants';

// Content moderation
export * from './content-moderation';

// Matching (types, converters, distance utilities)
export * from './matching';

// Payment (types, status mappers)
export * from './payment';

// Document validation (types, thresholds, validator functions)
export * from './validation';
