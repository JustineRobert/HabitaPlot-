import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { paymentService } from '../services/paymentService';
import { downloadReceiptHTML, copyToClipboard } from '../utils/exportUtils';
import toast from 'react-hot-toast';

const TransactionReceiptPage = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getTransaction(id);
      setTransaction(response.data || response);
    } catch (error) {
      console.error('Failed to load transaction receipt', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to load receipt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    try {
      downloadReceiptHTML(transaction);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleCopyTransactionId = () => {
    copyToClipboard(transaction.id);
    setCopied(true);
    toast.success('Transaction ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-4 items-start justify-between mb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Receipt</h1>
          <p className="text-gray-600">Printable receipt for your completed transaction.</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiDownload /> Download
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : !transaction ? (
        <div className="text-center text-gray-600 py-10">Loading receipt details...</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 print:p-0">
          <div className="mb-8 border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Receipt No.</p>
                <h2 className="text-2xl font-semibold text-gray-900">{transaction.receiptNumber}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  {transaction.status}
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Created on {new Date(transaction.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-gray-900 break-all">{transaction.id}</p>
                  <button
                    onClick={handleCopyTransactionId}
                    className="print:hidden p-1 hover:bg-gray-100 rounded"
                    title="Copy to clipboard"
                  >
                    {copied ? <FiCheck className="text-green-600" /> : <FiCopy className="text-gray-500" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-medium text-gray-900">
                  {transaction.currency} {Number(transaction.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="text-lg font-medium text-gray-900">{transaction.providerName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">{transaction.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Listing ID</p>
                <p className="text-lg font-medium text-gray-900">{transaction.listingId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-lg font-medium text-gray-900">{transaction.description || 'Listing payment'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-sm text-gray-600 print:hidden">
            <Link to="/transactions" className="text-blue-600 hover:underline">
              Back to transaction history
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReceiptPage;
