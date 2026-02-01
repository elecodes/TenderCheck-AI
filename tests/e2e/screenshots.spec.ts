import { test, expect } from '@playwright/test';
import { join } from 'path';

const mockAnalysis = {
  id: 'mock-123',
  userId: 'demo-user',
  tenderTitle: 'Suministro de Licencias Software IA',
  documentUrl: 'uploads/mock.pdf',
  status: 'COMPLETED',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  requirements: [
    { 
      id: '1', 
      text: 'Certificación ISO 27001 vigente', 
      type: 'TECHNICAL', 
      confidence: 0.99,
      source: { pageNumber: 5, snippet: '...se requiere certificación ISO 27001...' },
      keywords: ['ISO', '27001']
    },
    { 
      id: '2', 
      text: 'Disponibilidad del servicio 99.9% (SLA)', 
      type: 'TECHNICAL', // Fixed: SLA not in union type
      confidence: 0.98,
      source: { pageNumber: 12, snippet: '...SLA garantizado del 99.9% anual...' },
      keywords: ['SLA', 'uptime']
    },
    { 
      id: '3', 
      text: 'Soporte técnico 24/7 en español', 
      type: 'TECHNICAL', 
      confidence: 0.95,
      source: { pageNumber: 15, snippet: '...soporte 24x7 en idioma local...' },
      keywords: ['soporte', '24/7']
    },
    { 
      id: '4', 
      text: 'Experiencia mínima de 5 años en el sector público', 
      type: 'ADMINISTRATIVE', 
      confidence: 0.92,
      source: { pageNumber: 8, snippet: '...acreditar 5 años de experiencia...' },
      keywords: ['experiencia', '5 años']
    },
    { 
      id: '5', 
      text: 'Presupuesto máximo de 50.000€', 
      type: 'FINANCIAL', 
      confidence: 0.90,
      source: { pageNumber: 2, snippet: '...presupuesto base de licitación 50.000€...' },
      keywords: ['presupuesto', '50.000']
    }
  ],
  results: [] // Initially empty
};

const mockValidationResults = [
  { requirementId: '1', status: 'MET', confidence: 0.99, reasoning: 'La página 12 del anexo 3 incluye el certificado ISO 27001 válido hasta 2028.', evidence: { text: 'Certificado ISO 27001:2013', pageNumber: 12 } },
  { requirementId: '2', status: 'MET', confidence: 0.98, reasoning: 'Cláusula 4.2 garantiza un uptime del 99.95% anual.', evidence: { text: 'Garantía SLA 99.95%', pageNumber: 42 } },
  { requirementId: '3', status: 'PARTIALLY_MET', confidence: 0.75, reasoning: 'Se menciona soporte 24/7 pero no se especifica explícitamente el idioma español.', evidence: { text: 'Support Center 24/7 available', pageNumber: 15 } },
  { requirementId: '4', status: 'NOT_MET', confidence: 0.95, reasoning: 'La empresa se constituyó hace 3 años, no cumple con los 5 años requeridos.', evidence: { text: 'Fecha de constitución: 2023', pageNumber: 2 } },
  { requirementId: '5', status: 'MET', confidence: 0.99, reasoning: 'La oferta económica es de 48.500€, dentro del límite.', evidence: { text: 'Total Oferta: 48.500€', pageNumber: 1 } }
];

test('📸 Generate Marketing Screenshots & Video', async ({ page }) => {
  // 1. Setup
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ colorScheme: 'dark' });

  // 2. Setup Network Mocks for Instant Analysis
  
  // Mock 1: Tender Upload/Analysis (POST /api/tenders/analyze)
  await page.route('**/api/tenders/analyze', async route => {
    console.log('Intercepted /api/tenders/analyze');
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysis)
      });
    } else {
        await route.continue();
    }
  });

  // Mock 2: Validation (POST /api/tenders/:id/validate-proposal)
  await page.route('**/api/tenders/*/validate-proposal', async route => {
    console.log('Intercepted /validate-proposal');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: mockValidationResults })
    });
  });

  // Mock 3: History (GET /api/tenders) - Strict match
  await page.route('**/api/tenders', async route => {
    if (route.request().method() === 'GET') {
       await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockAnalysis])
      });
    } else {
        await route.continue();
    }
  });


  // 3. Landing Page
  await page.goto('/');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForSelector('nav');
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1000); 
  await page.screenshot({ path: 'screenshots/00-landing-page.png', fullPage: true });

  // 4. Login Page (Show Google Auth implementation)
  await page.goto('/login');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForSelector('text=Continuar con Google');
  await page.screenshot({ path: 'screenshots/01-login-page.png' });

  // 5. Register (Fast flow)
  await page.goto('/register');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForSelector('text=Continuar con Google');
  await page.screenshot({ path: 'screenshots/0B-register-page.png' });
  
  const uniqueId = Date.now();
  await page.fill('input[id="name"]', 'Demo User');
  await page.fill('input[id="email"]', `demo${uniqueId}@tendercheck.ai`);
  await page.fill('input[id="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(1000);

  // 5. Dashboard - Upload Pliego
  // Use fix: setInputFiles on hidden input
  await page.setInputFiles('#file-upload-pliego', 'tests/fixtures/dummy.pdf');
  await page.waitForTimeout(500); // Visual feedback

  // 6. Dashboard - Upload Oferta
  await page.setInputFiles('#file-upload-oferta', 'tests/fixtures/dummy.pdf');
  await page.waitForTimeout(500); // Visual feedback

  // Snapshot of "Ready to Analyze" state
  await page.screenshot({ path: 'screenshots/03-ready-to-analyze.png' });

  // 7. Click Analyze
  await page.click('button:has-text("Ejecutar Análisis Completo")');

  // 8. Wait for Results
  // Wait for loading indicator to disappear (if applicable) or check for table
  await expect(page.locator('text=Validando Cumplimiento...')).not.toBeVisible({ timeout: 15000 });
  
  // Wait for any part of the results to be visible
  await page.waitForSelector('table, .grid', { state: 'visible', timeout: 10000 });
  
  await page.waitForTimeout(2000); // Let animations finish

  // 9. Capture Results
  await page.mouse.wheel(0, 400); // Scroll to see details
  await page.screenshot({ path: 'screenshots/04-analysis-results.png', fullPage: true });
});
