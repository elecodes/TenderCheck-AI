import { Router } from "express";
import multer from "multer";
import { TenderController } from "../controllers/TenderController.js";
import { CreateTender } from "../../application/use-cases/CreateTender.js";
import { InMemoryTenderRepository } from "../../infrastructure/repositories/InMemoryTenderRepository.js";
import { PdfParserAdapter } from "../../infrastructure/adapters/PdfParserAdapter.js";
import { OllamaModelService } from "../../infrastructure/services/OllamaModelService.js";

import { ValidationEngine } from "../../domain/validation/ValidationEngine.js";
import { ScopeValidationRule } from "../../domain/validation/rules/ScopeValidationRule.js";
import { authMiddleware } from "../../infrastructure/middleware/authMiddleware.js";

// Composition Root (Simple Manual Dependency Injection)
// In a larger app, this would be in a dedicated DI container or factory
const repository = new InMemoryTenderRepository();
const pdfParser = new PdfParserAdapter();
const tenderAnalyzer = new OllamaModelService();
const validationEngine = new ValidationEngine([new ScopeValidationRule()]);

const createTenderUseCase = new CreateTender(
  repository,
  pdfParser,
  tenderAnalyzer,
  validationEngine,
);

import { ValidateProposal } from "../../application/use-cases/ValidateProposal.js";
const validateProposalUseCase = new ValidateProposal(
  repository,
  pdfParser,
  tenderAnalyzer,
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

export { router as tenderRouter };
