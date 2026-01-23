import type { Request, Response, NextFunction } from 'express';
import { CreateTender } from '../../application/use-cases/CreateTender.js';
import { AppError } from '../../domain/errors/AppError.js';

export class TenderController {
  constructor(private readonly createTender: CreateTender) {}

  analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw AppError.badRequest('No file uploaded');
      }

      const { buffer, originalname } = req.file;
      const { title } = req.body;

      if (!title) {
         // Title is optional in some flows, but usually required. Let's make it optional if missing for now or default.
         // Or throw bad request. Let's assume title is required or default to filename.
      }
      
      const tenderTitle = title || originalname;

      const result = await this.createTender.execute(tenderTitle, buffer, originalname);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
