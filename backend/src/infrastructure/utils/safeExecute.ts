import { AppError } from "../../domain/errors/AppError.js";

export async function safeExecute<T>(
  operation: () => Promise<T>,
  errorMessage = "Operation failed",
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // Log original error here if needed, or rely on global handler
    throw AppError.internal(`${errorMessage}: ${(error as Error).message}`);
  }
}
