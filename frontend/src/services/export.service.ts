import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { TenderAnalysis } from '../types';

// The autoTable plugin adds functionality to jsPDF. 
export const exportToJSON = (analysis: TenderAnalysis) => {
  const dataStr = JSON.stringify(analysis, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `analysis-${analysis.tenderTitle.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (analysis: TenderAnalysis) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.getWidth();

  // -- Header --
  doc.setFillColor(36, 43, 51); // Brand Dark
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TenderCheck AI', 14, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Análisis de Pliego', 14, 28);
  doc.text(new Date().toLocaleDateString(), pageWidth - 40, 28);

  // -- Tender Info --
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(analysis.tenderTitle, 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`ID del Análisis: ${analysis.id}`, 14, 62);

  // -- Requirements Table --
  const tableData = (analysis.requirements || []).map((req, index) => [
    index + 1,
    req.text,
    req.type,
    `${Math.round(req.confidence * 100)}%`
  ]);

  doc.autoTable({
    startY: 75,
    head: [['#', 'Requisito', 'Tipo', 'Confianza']],
    body: tableData,
    headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 75 },
    styles: { fontSize: 9, cellPadding: 4 }
  });

  // -- Compliance Summary if results exist --
  if (analysis.results && analysis.results.length > 0) {
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Validación de Oferta', 14, finalY);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validationData = analysis.results.map((res: any, index: number) => {
        const req = analysis.requirements?.find(r => r.id === res.requirementId);
        return [
            index + 1,
            req ? (req.text.substring(0, 60) + '...') : 'Req Desconocido',
            res.status,
            res.reasoning
        ];
    });

    doc.autoTable({
        startY: finalY + 5,
        head: [['#', 'Requisito', 'Cumplimiento', 'Justificación']],
        body: validationData,
        headStyles: { fillColor: [59, 130, 246] }, // Blue 500
        styles: { fontSize: 8 },
        columnStyles: {
            3: { cellWidth: 80 }
        }
    });
  }

  // -- Footer --
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount} - Generado por TenderCheck AI`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`TenderCheck_Report_${analysis.tenderTitle.replace(/\s+/g, '_')}.pdf`);
};
