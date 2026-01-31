import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Tender Analysis Flow', () => {
    test('Happy Path: Register, Upload Pliego and Analyze', async ({ page }) => {
        // Mock the Analyze API call (Network Interception)
        await page.route('**/api/tenders/analyze', async route => {
            const json = {
                id: "e2e-tender-123",
                tenderTitle: "e2e-tender", 
                // Ensure required fields for frontend are present
                requirements: [
                    {
                        id: "req-1",
                        text: "El sistema deberá usar react.",
                        type: "TECHNICAL",
                        keywords: ["react", "sistema"],
                        source: { pageNumber: 1, snippet: "El sistema deberá usar react." },
                        confidence: 1.0
                    }
                ],
                results: [],
                status: "COMPLETED",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await route.fulfill({ json });
        });

        // 1. Navigate to Home
        await page.goto('/');
        
        // 2. Register Flow
        // Wait for and click the Register link (using click to auto-wait)
        await page.getByRole('link', { name: /Comenzar/i }).click();
        
        // Fill Register Form
        await page.fill('input[name="name"]', 'Playwright User');
        await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'Password123!');
        
        // Submit
        await page.getByRole('button', { name: /Crear cuenta/i }).click();

        // 3. Verify Dashboard Access
        // Wait for redirect to /dashboard and "Subir Pliego" text
        await expect(page.getByText('Subir Pliego')).toBeVisible({ timeout: 15000 });

        // 4. Upload Pliego
        const fileInput = page.locator('input[type="file"]').first();
        const buffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Kids [3 0 R] /Count 1 /Type /Pages >>\nendobj\n3 0 obj\n<< /Type /Page /MediaBox [0 0 595 842] /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(El sistema deberá usar react.) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000219 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n323\n%%EOF'); 
        
        await fileInput.setInputFiles({
            name: 'pliego_fake.pdf',
            mimeType: 'application/pdf',
            buffer: buffer
        });

        await expect(page.getByText('pliego_fake.pdf')).toBeVisible();

        // 5. Title (if needed)
        const titleInput = page.getByPlaceholder('Título de la licitación');
        if (await titleInput.isVisible()) {
            await titleInput.fill('E2E Test Tender');
        }

        // 6. Analyze
        await page.getByRole('button', { name: /Analizar/i }).click();

        // 7. Results
        await expect(page.getByText('COMPLETADO')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('El sistema deberá usar react.')).toBeVisible();
    });
});
