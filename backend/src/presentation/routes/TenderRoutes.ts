import { Router } from "express";
import multer from "multer";
import { TenderController } from "../controllers/TenderController.js";
import { CreateTender } from "../../application/use-cases/CreateTender.js";
import { TursoTenderRepository } from "../../infrastructure/repositories/TursoTenderRepository.js";
import { PdfParserAdapter } from "../../infrastructure/adapters/PdfParserAdapter.js";
// import { MistralGenkitService } from "../../infrastructure/services/MistralGenkitService.js";
import { GeminiGenkitService } from "../../infrastructure/services/GeminiGenkitService.js";

import { ValidationEngine } from "../../domain/validation/ValidationEngine.js";
import { ScopeValidationRule } from "../../domain/validation/rules/ScopeValidationRule.js";
import { authMiddleware } from "../../infrastructure/middleware/authMiddleware.js";
import { AppError } from "../../domain/errors/AppError.js"; // Added from instruction

// Composition Root (Simple Manual Dependency Injection)
// In a larger app, this would be in a dedicated DI container or factory
const repository = new TursoTenderRepository();
const pdfParser = new PdfParserAdapter();
const aiService = new GeminiGenkitService(); // Replaced Mistral with Gemini and renamed variable
const validationEngine = new ValidationEngine([new ScopeValidationRule()]);

const createTenderUseCase = new CreateTender(
  repository,
  pdfParser,
  aiService, // Using aiService
);

import { ValidateProposal } from "../../application/use-cases/ValidateProposal.js";
const validateProposalUseCase = new ValidateProposal(
  repository,
  pdfParser,
  aiService,
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
  tenderController.analyze,
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
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const userId = (req as any).user?.userId;

    const tender = await repository.findById(id);
    if (!tender) {
      res.status(404).json({ error: "Tender not found" });
      return;
    }

    if (tender.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    await repository.delete(id);
    res.json({ status: "success", message: "Tender deleted" });
  } catch (error) {
    next(error);
  }
});

export { router as tenderRouter };
