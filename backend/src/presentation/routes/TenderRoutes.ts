import { Router } from 'express';
import multer from 'multer';
import { TenderController } from '../controllers/TenderController.js';
import { CreateTender } from '../../application/use-cases/CreateTender.js';
import { InMemoryTenderRepository } from '../../infrastructure/repositories/InMemoryTenderRepository.js';
import { PdfParserAdapter } from '../../infrastructure/adapters/PdfParserAdapter.js';
import { OpenAIModelService } from '../../infrastructure/services/OpenAIModelService.js';

import { ValidationEngine } from '../../domain/validation/ValidationEngine.js';
import { ScopeValidationRule } from '../../domain/validation/rules/ScopeValidationRule.js';

import { LocalRAGLegalService } from '../../infrastructure/services/LocalRAGLegalService.js';
import { MockLegalService } from '../../infrastructure/services/MockLegalService.js';
import { ValidateProposal } from '../../application/use-cases/ValidateProposal.js';

// Composition Root (Simple Manual Dependency Injection)
// In a larger app, this would be in a dedicated DI container or factory
const tenderRepo = new InMemoryTenderRepository();
const pdfParser = new PdfParserAdapter();
const aiService = new OpenAIModelService(); // Now implements compareProposal
const validationEngine = new ValidationEngine([
  new ScopeValidationRule()
]);

// Phase 7: Legal Service Injection
const apiKey = process.env.OPENAI_API_KEY;
const legalService = apiKey
    ? new LocalRAGLegalService(apiKey)
    : new MockLegalService(); // Fallback if no key

if (!apiKey) {
    console.warn("⚠️  [TenderRoutes] No OPENAI_API_KEY found. Using MockLegalService.");
}

// Use Cases
const createTender = new CreateTender(
  tenderRepo,
  pdfParser,
  aiService,
  validationEngine
);

const validateProposalUseCase = new ValidateProposal(
  tenderRepo,
  pdfParser,
  aiService,
  legalService
);

const tenderController = new TenderController(createTender); // Corrected to use 'createTender'

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// POST /api/tenders/analyze (Pliego)
router.post('/analyze', upload.single('file'), tenderController.analyze);

// POST /api/tenders/:id/validate-proposal (Oferta)
router.post('/:id/validate-proposal', upload.single('file'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') throw new Error("Invalid Tender ID");
    if (!req.file) throw new Error("No file uploaded");
    
    // Quick inline controller logic for MVP speed
    const results = await validateProposalUseCase.execute(id, req.file.buffer);
    res.json({ status: 'success', results });
  } catch (error) {
    next(error);
  }
});

export { router as tenderRouter };
