/**
 * Export Utilities
 * Handles receipt PDF generation and transaction CSV export.
 */

/**
 * Generate and download a receipt as PDF
 * Requires html2pdf.js library
 */
export const downloadReceiptPDF = (transaction) => {
  if (!transaction) {
    console.error('No transaction provided for PDF generation');
    return;
  }

  // Create a simple receipt HTML structure
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${transaction.receiptNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f9fafb;
        }
        .receipt-container {
          max-width: 600px;
          background-color: white;
          margin: 0 auto;
          padding: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #1e40af;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .receipt-header h1 {
          margin: 0;
          color: #1e40af;
          font-size: 24px;
        }
        .receipt-header p {
          margin: 5px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }
        .receipt-body {
          margin-bottom: 20px;
        }
        .receipt-section {
          margin-bottom: 20px;
        }
        .receipt-section-title {
          font-weight: bold;
          color: #374151;
          margin-bottom: 10px;
          font-size: 12px;
          text-transform: uppercase;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 8px;
        }
        .receipt-label {
          color: #6b7280;
          font-size: 13px;
        }
        .receipt-value {
          color: #1f2937;
          font-size: 13px;
          font-weight: 500;
        }
        .receipt-footer {
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-completed {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-failed {
          background-color: #fee2e2;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-header">
          <h1>Payment Receipt</h1>
          <p>HabitaPlot™ Transaction Record</p>
        </div>

        <div class="receipt-body">
          <div class="receipt-section">
            <div class="receipt-section-title">Receipt Information</div>
            <div class="receipt-row">
              <span class="receipt-label">Receipt Number</span>
              <span class="receipt-value">${transaction.receiptNumber}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Transaction ID</span>
              <span class="receipt-value">${transaction.id}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Date</span>
              <span class="receipt-value">${new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Status</span>
              <span class="receipt-value">
                <span class="status-badge status-${transaction.status}">
                  ${transaction.status.toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          <div class="receipt-section">
            <div class="receipt-section-title">Payment Details</div>
            <div class="receipt-row">
              <span class="receipt-label">Provider</span>
              <span class="receipt-value">${transaction.providerName}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Phone Number</span>
              <span class="receipt-value">${transaction.phoneNumber}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Amount</span>
              <span class="receipt-value">${transaction.currency} ${Number(transaction.amount).toLocaleString()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Description</span>
              <span class="receipt-value">${transaction.description || 'Listing payment'}</span>
            </div>
            ${transaction.listingId ? `
            <div class="receipt-row">
              <span class="receipt-label">Listing ID</span>
              <span class="receipt-value">${transaction.listingId}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="receipt-footer">
          <p>This is an official receipt for your HabitaPlot™ payment transaction.</p>
          <p>For support, please contact our customer service team.</p>
          <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create blob and download
  const element = document.createElement('a');
  const file = new Blob([receiptHTML], { type: 'text/html' });
  element.href = URL.createObjectURL(file);
  element.download = `receipt-${transaction.receiptNumber}.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

/**
 * Download receipt as printable HTML
 */
export const downloadReceiptHTML = (transaction) => {
  if (!transaction) {
    console.error('No transaction provided');
    return;
  }
  downloadReceiptPDF(transaction);
};

/**
 * Export transactions to CSV format
 */
export const exportTransactionsToCSV = (transactions, filename = 'transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    console.warn('No transactions to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Receipt Number',
    'Transaction ID',
    'Provider',
    'Amount',
    'Currency',
    'Status',
    'Phone Number',
    'Description',
    'Listing ID',
    'Date Created',
    'Date Updated'
  ];

  // Map transaction data to CSV rows
  const rows = transactions.map((txn) => [
    txn.receiptNumber,
    txn.id,
    txn.providerName,
    txn.amount,
    txn.currency,
    txn.status,
    txn.phoneNumber || '',
    txn.description || '',
    txn.listingId || '',
    new Date(txn.createdAt).toLocaleString(),
    new Date(txn.updatedAt).toLocaleString()
  ]);

  // Escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\n');

  // Create blob and download
  const element = document.createElement('a');
  const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

/**
 * Copy transaction ID to clipboard
 */
export const copyToClipboard = (text) => {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  } else {
    navigator.clipboard.writeText(text);
  }
};
