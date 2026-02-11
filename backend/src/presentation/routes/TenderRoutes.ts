import { Router } from "express";
import multer from "multer";
import { TenderController } from "../controllers/TenderController.js";
import { CreateTender } from "../../application/use-cases/CreateTender.js";
import { TursoTenderRepository } from "../../infrastructure/repositories/TursoTenderRepository.js";
import { PdfParserAdapter } from "../../infrastructure/adapters/PdfParserAdapter.js";
import { GeminiGenkitService } from "../../infrastructure/services/GeminiGenkitService.js";

import { authMiddleware } from "../../infrastructure/middleware/authMiddleware.js";
import { AppError } from "../../domain/errors/AppError.js";

import { ValidateProposal } from "../../application/use-cases/ValidateProposal.js";
import { VectorSearchService } from "../../infrastructure/services/VectorSearchService.js";

const repository = new TursoTenderRepository();
const pdfParser = new PdfParserAdapter();
const aiService = new GeminiGenkitService();
const vectorSearch = new VectorSearchService();

const createTenderUseCase = new CreateTender(
  repository,
  pdfParser,
  aiService,
  vectorSearch,
);

const validateProposalUseCase = new ValidateProposal(
  repository,
  pdfParser,
  aiService,
  vectorSearch,
);

const tenderController = new TenderController(createTenderUseCase);

const router = Router();
import { MAX_FILE_SIZE_BYTES } from "../../config/constants.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF documents are allowed."));
    }
  },
});

// POST /api/tenders/analyze (Pliego)
router.post(
  "/analyze",
  authMiddleware,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) throw AppError.badRequest("No file uploaded");
      const userId = (req as any).user?.userId;
      if (!userId) throw AppError.unauthorized("User session not found");

      const { industry } = req.body; // New: Optional industry parameter

      const result = await createTenderUseCase.execute(
        userId,
        req.file.buffer,
        industry,
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/tenders/:id/validate-proposal (Oferta)
router.post(
  "/:id/validate-proposal",
  authMiddleware,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") throw new Error("Invalid Tender ID");
      if (!req.file) throw new Error("No file uploaded");

      // Quick inline controller logic for MVP speed
      const results = await validateProposalUseCase.execute(
        id,
        req.file.buffer,
      );
      res.json({ status: "success", results });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/tenders (History for current user)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new Error("User not authenticated");

    const history = await repository.findByUserId(userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tenders/:id
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw AppError.badRequest("Invalid ID");
    }

    const userId = (req as any).user?.userId;

    const tender = await repository.findById(id);
    if (!tender) {
      throw AppError.notFound("Tender not found");
    }

    if (tender.userId !== userId) {
      throw AppError.forbidden("Unauthorized");
    }

    await repository.delete(id);
    res.json({ status: "success", message: "Tender deleted" });
  } catch (error) {
    next(error);
  }
});

export { router as tenderRouter };
