import type { Request, Response, NextFunction } from "express";
import { CreateTender } from "../../application/use-cases/CreateTender.js";
import { AppError } from "../../domain/errors/AppError.js";

import { z } from "zod";

import { MAX_FILE_SIZE_BYTES } from "../../config/constants.js";

const uploadSchema = z.object({
  mimetype: z.literal("application/pdf"),
  size: z.number().max(MAX_FILE_SIZE_BYTES).min(1),
});

export class TenderController {
  constructor(private readonly createTender: CreateTender) {}

  analyze = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw AppError.badRequest("No file uploaded");
      }

      // Secondary Validation Layer
      try {
        uploadSchema.parse({
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
      } catch (error) {
        // If validation fails or other error
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: "Validation Error",
            details: (error as any).errors,
          });
          return; // Return after sending response to prevent further execution
        }
        // Re-throw any other unexpected errors from the inner try block
        throw error;
      }

      const { buffer, originalname } = req.file;
      const { title } = req.body;

      if (!title) {
        // Title is optional in some flows, but usually required. Let's make it optional if missing for now or default.
        // Or throw bad request. Let's assume title is required or default to filename.
      }

      const tenderTitle = title || originalname;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await this.createTender.execute(
        userId,
        tenderTitle,
        buffer,
        originalname,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
