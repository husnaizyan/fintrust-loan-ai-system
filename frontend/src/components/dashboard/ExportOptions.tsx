import { Download, FileSpreadsheet, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LoanApplication } from '@/types/loan';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptionsProps {
  applications?: LoanApplication[];
}

export function ExportOptions({ applications = [] }: ExportOptionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportExcel = () => {
    if (applications.length === 0) {
      toast({
        title: 'No Data',
        description: 'No applications to export.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['ID', 'Applicant Name', 'Date', 'Income', 'Loan Amount', 'Status', 'Signature Verified'];
    const rows = applications.map((app) => [
      app.id,
      app.applicant_name,
      new Date(app.created_at || '').toLocaleDateString(),
      app.monthly_income,
      app.loan_amount,
      app.status,
      app.signature_verified ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `loan_applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export Complete',
      description: `Exported ${applications.length} applications to CSV.`,
    });
  };

  const handleExportPDF = () => {
    if (applications.length === 0) {
      toast({
        title: 'No Data',
        description: 'No applications to export.',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Loan Applications Report', 14, 22);
    
    // Subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Table
    const tableData = applications.map((app) => [
      app.id,
      app.applicant_name,
      new Date(app.created_at || '').toLocaleDateString(),
      formatCurrency(app.monthly_income),
      formatCurrency(app.loan_amount),
      app.status.toUpperCase(),
      app.signature_verified ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      head: [['ID', 'Applicant', 'Date', 'Income', 'Loan Amount', 'Status', 'Signed']],
      body: tableData,
      startY: 38,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        5: { 
          cellWidth: 20,
          fontStyle: 'bold',
        },
      },
    });

    doc.save(`loan_applications_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'PDF Export Complete',
      description: `Exported ${applications.length} applications to PDF.`,
    });
  };

  const handleGenerateReport = () => {
    if (applications.length === 0) {
      toast({
        title: 'No Data',
        description: 'No applications to generate report.',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    
    // Calculate statistics
    const total = applications.length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';
    const avgLoanAmount = total > 0 
      ? applications.reduce((sum, a) => sum + a.loan_amount, 0) / total 
      : 0;
    const avgIncome = total > 0 
      ? applications.reduce((sum, a) => sum + a.monthly_income, 0) / total 
      : 0;
    const signedCount = applications.filter((a) => a.signature_verified).length;

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FINTRUST AI', 14, 20);
    doc.setFontSize(12);
    doc.text('Comprehensive Analytics Report', 14, 30);
    
    // Report date
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(`Report Generated: ${today}`, 14, 50);
    
    // Executive Summary Section
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Executive Summary', 14, 65);
    
    doc.setDrawColor(30, 58, 138);
    doc.line(14, 68, 196, 68);
    
    // Summary stats in boxes
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const summaryY = 78;
    const boxWidth = 42;
    const boxHeight = 25;
    const gap = 4;
    
    // Box 1: Total Applications
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, summaryY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(8);
    doc.text('Total Applications', 16, summaryY + 8);
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text(total.toString(), 16, summaryY + 20);
    
    // Box 2: Approval Rate
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14 + boxWidth + gap, summaryY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('Approval Rate', 16 + boxWidth + gap, summaryY + 8);
    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.text(`${approvalRate}%`, 16 + boxWidth + gap, summaryY + 20);
    
    // Box 3: Avg Loan Amount
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14 + (boxWidth + gap) * 2, summaryY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('Avg Loan Amount', 16 + (boxWidth + gap) * 2, summaryY + 8);
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text(formatCurrency(avgLoanAmount), 16 + (boxWidth + gap) * 2, summaryY + 20);
    
    // Box 4: Signature Rate
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14 + (boxWidth + gap) * 3, summaryY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('Signature Rate', 16 + (boxWidth + gap) * 3, summaryY + 8);
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    const signatureRate = total > 0 ? ((signedCount / total) * 100).toFixed(1) : '0';
    doc.text(`${signatureRate}%`, 16 + (boxWidth + gap) * 3, summaryY + 20);

    // Status Breakdown Section
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Status Breakdown', 14, 120);
    doc.line(14, 123, 196, 123);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const statusY = 133;
    doc.text(`• Approved: ${approved} applications`, 20, statusY);
    doc.text(`• Rejected: ${rejected} applications`, 20, statusY + 8);
    doc.text(`• Pending: ${pending} applications`, 20, statusY + 16);
    
    // Income Analysis
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Income Analysis', 14, 175);
    doc.line(14, 178, 196, 178);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`• Average Applicant Income: ${formatCurrency(avgIncome)}`, 20, 188);
    doc.text(`• Average Requested Loan: ${formatCurrency(avgLoanAmount)}`, 20, 196);
    const avgRatio = avgIncome > 0 ? (avgLoanAmount / avgIncome * 100).toFixed(1) : '0';
    doc.text(`• Average Loan-to-Income Ratio: ${avgRatio}%`, 20, 204);

    // Applications Table
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Applications List', 14, 220);
    doc.line(14, 223, 196, 223);

    const tableData = applications.map((app) => [
      app.id,
      app.applicant_name,
      new Date(app.created_at || '').toLocaleDateString(),
      formatCurrency(app.loan_amount),
      app.status.toUpperCase(),
    ]);

    autoTable(doc, {
      head: [['ID', 'Applicant', 'Date', 'Loan Amount', 'Status']],
      body: tableData,
      startY: 228,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | FINTRUST AI - Confidential`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`fintrust_full_report_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'Report Generated',
      description: 'Your comprehensive analytics report has been downloaded.',
    });
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Download className="h-4 w-4" />
        <span className="text-sm font-medium">Export Options</span>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleExportExcel}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2 text-success" />
          Export to Excel
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleExportPDF}
        >
          <FileText className="h-4 w-4 mr-2 text-destructive" />
          Export to PDF
        </Button>

        <Button
          variant="gradient"
          size="sm"
          className="w-full justify-start"
          onClick={handleGenerateReport}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Full Report
        </Button>
      </div>
    </div>
  );
}
