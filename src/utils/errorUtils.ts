// Path: src/utils/errorUtils.ts
// Provides centralized error handling utilities for the Axe Handle code generator.

import { AxeError, ErrorPrefix, AxeErrorCategory, McpErrorCategory } from '../types';

/**
 * Creates an Axe Handle error.
 * @param prefix Error prefix (AXE or MCP)
 * @param category Error category
 * @param code Numeric error code within the category
 * @param message Human-readable error message
 * @param details Additional details about the error (e.g., file name, line number)
 * @param cause Underlying error, if any
 * @returns A structured AxeError object
 */
export function createError(
  prefix: ErrorPrefix,
  category: AxeErrorCategory | McpErrorCategory,
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return {
    code: `${prefix}-${category}${String(code).padStart(3, '0')}`,
    message,
    details,
    cause,
  };
}

/**
 * Creates an Axe Handle parser error.
 * @param code Numeric error code
 * @param message Error message
 * @param details Additional error details
 * @param cause Underlying error cause
 * @returns AxeError object
 */
export function createParserError(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return createError(
    ErrorPrefix.AXE,
    AxeErrorCategory.PARSER,
    code,
    message,
    details,
    cause
  );
}

/**
 * Creates an Axe Handle CLI error.
 * @param code Numeric error code
 * @param message Error message
 * @param details Additional error details
 * @param cause Underlying error cause
 * @returns AxeError object
 */
export function createCliError(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return createError(
    ErrorPrefix.AXE,
    AxeErrorCategory.CLI,
    code,
    message,
    details,
    cause
  );
}

/**
 * Creates an Axe Handle generator error.
 * @param code Numeric error code
 * @param message Error message
 * @param details Additional error details
 * @param cause Underlying error cause
 * @returns AxeError object
 */
export function createGeneratorError(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return createError(
    ErrorPrefix.AXE,
    AxeErrorCategory.GENERATOR,
    code,
    message,
    details,
    cause
  );
}

/**
 * Creates an Axe Handle mapper error.
 * @param code Numeric error code
 * @param message Error message
 * @param details Additional error details
 * @param cause Underlying error cause
 * @returns AxeError object
 */
export function createMapperError(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return createError(
    ErrorPrefix.AXE,
    AxeErrorCategory.MAPPER,
    code,
    message,
    details,
    cause
  );
}

/**
 * Creates an MCP specification error.
 * @param code Numeric error code
 * @param message Error message
 * @param details Additional error details
 * @param cause Underlying error cause
 * @returns AxeError object
 */
export function createMcpSpecError(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return createError(
    ErrorPrefix.MCP,
    McpErrorCategory.SPECIFICATION,
    code,
    message,
    details,
    cause
  );
}

/**
 * Creates an MCP runtime error.
 * @param code Numeric error code
 * @param message Error message
 * @param details Additional error details
 * @param cause Underlying error cause
 * @returns AxeError object
 */
export function createMcpRuntimeError(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  cause?: Error | AxeError
): AxeError {
  return createError(
    ErrorPrefix.MCP,
    McpErrorCategory.RUNTIME,
    code,
    message,
    details,
    cause
  );
}

/**
 * Formats an error message for CLI display with proper coloring.
 * This function should be used in the CLI module to format error messages
 * before displaying them to the user.
 * 
 * @param error The error to format
 * @returns Formatted error message ready for CLI display
 */
export function formatErrorForCli(error: Error | AxeError): string {
  // This implementation would use chalk for colors
  // but we're leaving it as a stub for now
  if ('code' in error) {
    const axeError = error as AxeError;
    let message = `ERROR ${axeError.code}: ${axeError.message}`;
    
    if (axeError.details) {
      message += '\n\nDetails:';
      for (const [key, value] of Object.entries(axeError.details)) {
        message += `\n  ${key}: ${value}`;
      }
    }
    
    if (axeError.cause) {
      message += `\n\nCaused by: ${formatErrorForCli(axeError.cause)}`;
    }
    
    return message;
  } else {
    return `ERROR: ${error.message}`;
  }
}

/**
 * Wraps a function with error handling logic.
 * If the function throws an error, it will be caught and wrapped in an AxeError.
 * 
 * @param fn The function to wrap
 * @param errorCreator A function that creates an AxeError
 * @returns A wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorCreator: (code: number, message: string, details?: Record<string, unknown>, cause?: Error) => AxeError
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        // Error is already an AxeError, rethrow
        throw error;
      }
      
      throw errorCreator(
        999, // Generic error code
        'An unexpected error occurred',
        { function: fn.name },
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };
}
