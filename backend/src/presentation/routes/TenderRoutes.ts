import { Router } from 'express';
import multer from 'multer';
import { TenderController } from '../controllers/TenderController.js';
import { CreateTender } from '../../application/use-cases/CreateTender.js';
import { InMemoryTenderRepository } from '../../infrastructure/repositories/InMemoryTenderRepository.js';
import { PdfParserAdapter } from '../../infrastructure/adapters/PdfParserAdapter.js';
import { RequirementsExtractor } from '../../domain/services/RequirementsExtractor.js';

import { ValidationEngine } from '../../domain/validation/ValidationEngine.js';
import { ScopeValidationRule } from '../../domain/validation/rules/ScopeValidationRule.js';

// Composition Root (Simple Manual Dependency Injection)
// In a larger app, this would be in a dedicated DI container or factory
const repository = new InMemoryTenderRepository();
const pdfParser = new PdfParserAdapter();
const requirementsExtractor = new RequirementsExtractor();
const validationEngine = new ValidationEngine([
  new ScopeValidationRule()
]);

const createTenderUseCase = new CreateTender(
  repository,
  pdfParser,
  requirementsExtractor,
  validationEngine
);

const tenderController = new TenderController(createTenderUseCase);

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// POST /api/tenders/analyze
router.post('/analyze', upload.single('file'), tenderController.analyze);

export { router as tenderRouter };
