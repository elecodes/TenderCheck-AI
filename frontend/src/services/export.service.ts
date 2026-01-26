import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TenderAnalysis, ValidationResult } from '../types';

// The autoTable plugin adds functionality to jsPDF. 
export const exportToJSON = (analysis: TenderAnalysis) => {
  try {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (analysis.tenderTitle || 'analysis').replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
    link.download = `analysis-${safeTitle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exporting JSON:', err);
  }
};

export const exportToPDF = (analysis: TenderAnalysis) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

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
    doc.text(analysis.tenderTitle || 'Licitación sin título', 14, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`ID del Análisis: ${analysis.id}`, 14, 62);

    // -- Requirements Table --
    const tableData = (analysis.requirements || []).map((req, index) => [
      index + 1,
      req.text || '',
      req.type || 'N/A',
      `${Math.round((req.confidence || 0) * 100)}%`
    ]);

    autoTable(doc, {
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
      // @ts-ignore - autoTable adds lastAutoTable to doc
      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      const spaceToBottom = pageHeight - finalY;
      
      // If not much space left, start on new page
      if (spaceToBottom < 60) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Validación de Oferta', 14, 20);
      } else {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Validación de Oferta', 14, finalY + 15);
      }

      const validationData = analysis.results.map((res: ValidationResult, index: number) => {
          const req = analysis.requirements?.find(r => r.id === res.requirementId);
          return [
              index + 1,
              req ? (req.text.substring(0, 60) + '...') : (res.requirementId || 'Desconocido'),
              res.status,
              res.reasoning || ''
          ];
      });

      autoTable(doc, {
          startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 30,
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
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por TenderCheck AI`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const safeFileName = (analysis.tenderTitle || 'Reporte').replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
    doc.save(`TenderCheck_Report_${safeFileName}.pdf`);
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('Error al generar el PDF. Por favor, revisa la consola.');
  }
};
