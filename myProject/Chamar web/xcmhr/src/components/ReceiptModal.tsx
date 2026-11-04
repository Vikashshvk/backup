import React from 'react';
import { useCommunity } from '../context/CommunityContext';
import { formatCurrency, formatDate, amountInWords } from '../utils/formatters';
import { Printer, X, CheckCircle2, ShieldCheck, Download, Clock } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { selectedReceipt, setSelectedReceipt, settings, addToast } = useCommunity();

  if (!selectedReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const text = `Receipt #${selectedReceipt.receiptNumber}
Donor: ${selectedReceipt.memberName}
Amount: ${formatCurrency(selectedReceipt.amount)}
Purpose: ${selectedReceipt.category}
UTR: ${selectedReceipt.utrOrRefNumber}
Status: ${selectedReceipt.status.toUpperCase()}
Chamar Clan Community Welfare Fund`;
    navigator.clipboard.writeText(text);
    addToast({
      type: 'info',
      title: 'Receipt Details Copied',
      message: 'Summary copied to clipboard for sharing on WhatsApp or SMS.',
    });
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white"
    >
      <div
        id="receipt-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-6 print:shadow-none print:border-none print:m-0 print:max-w-none"
      >
        {/* Top Action Bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
              Official Contribution Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="copy-receipt-btn"
              onClick={handleCopyDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              title="Copy Summary"
            >
              <Download className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              id="close-receipt-btn"
              onClick={() => setSelectedReceipt(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 sm:p-10 relative bg-white" id="printable-receipt-content">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <div className="w-96 h-96 rounded-full border-[24px] border-blue-900 flex items-center justify-center">
              <span className="text-6xl font-black text-blue-900">CHAMAR</span>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-blue-900 gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0 border-2 border-blue-400">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {settings.communityName}
                </h2>
                <p className="text-xs text-blue-800 font-medium tracking-wide">
                  {settings.tagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Est. {settings.establishedYear} • Regd. Trust & Welfare Samiti • New Delhi
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Receipt Number
                </span>
                <span className="font-mono text-sm font-bold text-blue-900">
                  {selectedReceipt.receiptNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Date: {formatDate(selectedReceipt.date)}
              </p>
            </div>
          </div>

          {/* Status Banner */}
          <div className="my-5 flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              {selectedReceipt.status === 'verified' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Verified Contribution
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Approved by {selectedReceipt.verifiedBy || 'Executive Committee'}
                    </span>
                  </div>
                </>
              ) : selectedReceipt.status === 'pending' ? (
                <>
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Pending Verification
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Under review by Committee Treasurer
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  Verification Rejected
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Payment Mode
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {selectedReceipt.paymentMethod}
              </span>
            </div>
          </div>

          {/* Donor & Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                Received With Thanks From
              </span>
              <p className="text-base font-bold text-slate-900">
                {selectedReceipt.memberName}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Contact: +91 {selectedReceipt.mobile}
              </p>
              {selectedReceipt.gotraOrVillage && (
                <p className="text-xs text-blue-900 font-medium mt-1">
                  Clan / Location: {selectedReceipt.gotraOrVillage}
                </p>
              )}
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                Contribution Purpose
              </span>
              <p className="text-sm font-bold text-blue-900">
                {selectedReceipt.category}
              </p>
              <div className="mt-2 text-xs text-slate-600">
                <span className="text-slate-500">Transaction / UTR Ref:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {selectedReceipt.utrOrRefNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-blue-200">
                  Total Contribution Amount
                </span>
                <div className="text-3xl font-extrabold tracking-tight mt-0.5 text-white">
                  {formatCurrency(selectedReceipt.amount)}
                </div>
              </div>
              <div className="text-right sm:max-w-xs">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">
                  Amount In Words
                </span>
                <p className="text-xs font-medium text-white italic mt-0.5">
                  {amountInWords(selectedReceipt.amount)}
                </p>
              </div>
            </div>
          </div>

          {selectedReceipt.notes && (
            <div className="mb-6 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              <span className="font-semibold text-slate-800">Donor Note:</span>{' '}
              {selectedReceipt.notes}
            </div>
          )}

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Digitally Sealed & Authorized
              </div>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                This is a computer generated authentic community receipt under the bylaws of the
                Chamar Clan Welfare Samiti. All funds are subject to public community audits.
              </p>
            </div>

            <div className="text-center">
              <div className="font-serif italic text-sm text-blue-950 font-bold tracking-wider mb-1">
                Rakesh B. Sonkar
              </div>
              <div className="w-32 h-0.5 bg-slate-300 mx-auto mb-1"></div>
              <p className="text-xs font-bold text-slate-800">Er. Rakesh Babu Sonkar</p>
              <p className="text-[10px] text-slate-500">Treasurer, Chamar Clan Fund</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
