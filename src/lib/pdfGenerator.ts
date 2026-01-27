import jsPDF from 'jspdf';

interface AuditResults {
  url: string;
  seo_score: number;
  aeo_score: number;
  global_score: number;
  ai_visibility: { name: string; score: number }[];
  analysis?: { speed?: string; metadata?: string; structured_data?: string };
  recommendations?: { title: string; description: string; priority: string; category: string }[];
  metadata?: { title?: string; description?: string };
  created_at?: string;
}

const getScoreColor = (score: number): [number, number, number] => {
  if (score >= 70) return [16, 185, 129]; // green
  if (score >= 40) return [245, 158, 11]; // yellow
  return [239, 68, 68]; // red
};

export const generateAuditPDF = (results: AuditResults) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header with brand
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Ai Seen', 20, 28);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Rapport d\'Audit SEO/AEO', 20, 38);
  
  // Date
  const date = results.created_at ? new Date(results.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(`Généré le ${date}`, pageWidth - 60, 38);
  
  y = 60;
  
  // URL analyzed
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('Site analysé:', 20, y);
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(12);
  doc.text(results.url, 20, y + 8);
  
  y += 25;
  
  // Scores section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Scores', 20, y);
  y += 15;
  
  const scores = [
    { label: 'Score SEO', value: results.seo_score },
    { label: 'Score AEO', value: results.aeo_score },
    { label: 'Score Global', value: results.global_score }
  ];
  
  scores.forEach((score, i) => {
    const x = 20 + (i * 60);
    const color = getScoreColor(score.value);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, 50, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(`${score.value}`, x + 25, y + 18, { align: 'center' });
    doc.setFontSize(8);
    doc.text(score.label, x + 25, y + 26, { align: 'center' });
  });
  
  y += 45;
  
  // AI Visibility
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Visibilité IA', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  results.ai_visibility?.forEach((ai) => {
    const color = getScoreColor(ai.score);
    doc.setTextColor(80, 80, 80);
    doc.text(`${ai.name}:`, 25, y);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${ai.score}%`, 80, y);
    y += 7;
  });
  
  y += 10;
  
  // Recommendations
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommandations', 20, y);
  y += 12;
  
  results.recommendations?.forEach((rec, i) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, y, pageWidth - 40, 25, 2, 2, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}. ${rec.title}`, 25, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const desc = doc.splitTextToSize(rec.description, pageWidth - 50);
    doc.text(desc[0], 25, y + 18);
    y += 30;
  });
  
  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('© Ai Seen - Optimisez votre visibilité dans l\'ère de l\'IA', pageWidth / 2, 285, { align: 'center' });
  
  // Download
  const domain = new URL(results.url).hostname.replace('www.', '');
  doc.save(`audit-seo-${domain}.pdf`);
};
