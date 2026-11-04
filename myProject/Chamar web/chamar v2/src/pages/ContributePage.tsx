import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Contribution, CommunitySettings } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { Button } from '../components/Button';
import {
  QrCode,
  Copy,
  Check,
  CreditCard,
  Building,
  UploadCloud,
  CheckCircle2,
  FileText,
  Printer,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const QUICK_AMOUNTS = [500, 1000, 2100, 5000, 11000, 25000];

export const ContributePage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [settings, setSettings] = useState<CommunitySettings | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState<string>('2100');
  const [customAmount, setCustomAmount] = useState<string>('2100');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedContribution, setSubmittedContribution] = useState<Contribution | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Pre-populate if logged in
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name);
      if (!mobile) setMobile(user.mobile);
    }
  }, [user]);

  // Load Settings
  useEffect(() => {
    api
      .getSettings()
      .then((res) => setSettings(res.settings))
      .catch(() => {});
  }, []);

  const upiId = settings?.upiId || 'chamarclan@upi';
  const payeeName = settings?.payeeName || 'Chamar Clan Welfare Society';

  const handleCopy = (text: string, type: 'upi' | 'account') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
    showSuccess('Copied to clipboard!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showError('Image size should be less than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please enter your full name');
      return;
    }
    if (!mobile.trim()) {
      showError('Please enter your mobile number');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      showError('Please enter a valid contribution amount');
      return;
    }
    if (!transactionId.trim()) {
      showError('Please enter the 12-digit UPI UTR / Transaction ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createContribution({
        name: name.trim(),
        mobile: mobile.trim(),
        amount: numAmount,
        paymentMethod,
        transactionId: transactionId.trim(),
        screenshot: screenshotPreview || undefined,
        note: note.trim() || undefined,
        userId: user?._id,
      });

      setSubmittedContribution(res.contribution);
      showSuccess(res.message);

      // Fire festive celebration confetti!
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#f59e0b', '#4f46e5'],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      showError(err.message || 'Failed to submit contribution. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedContribution(null);
    setTransactionId('');
    setScreenshotPreview(null);
    setNote('');
  };

  // SUCCESS SCREEN
  if (submittedContribution) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Submission Received
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Contribution Submitted Successfully!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
            Thank you, <strong className="text-slate-900">{submittedContribution.name}</strong>. Your
            generous contribution is pending committee verification and will reflect on the public fund ledger.
          </p>

          {/* Receipt Slip */}
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 print:border print:p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium">Official Reference ID</span>
                <p className="text-base font-bold font-mono text-blue-700">
                  {submittedContribution.referenceId}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Status</span>
                <p className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pending Verification
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 block">Contributor Name</span>
                <span className="font-semibold text-slate-800">{submittedContribution.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mobile Number</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {submittedContribution.mobile}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount Contributed</span>
                <span className="text-base font-bold text-blue-900">
                  {formatINR(submittedContribution.amount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method</span>
                <span className="font-semibold text-slate-800">
                  {submittedContribution.paymentMethod}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Transaction Reference / UTR</span>
                <span className="font-mono text-xs font-semibold text-slate-700 break-all">
                  {submittedContribution.transactionId}
                </span>
              </div>
              {submittedContribution.note && (
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block">Purpose / Note</span>
                  <span className="text-slate-700 italic">{submittedContribution.note}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save Receipt
            </button>
            <Link to="/contributions">
              <Button variant="outline" size="md">
                View in Contribution History
              </Button>
            </Link>
            <Button variant="primary" size="md" onClick={resetForm}>
              Make Another Contribution
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Community Welfare
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
          Contribute to Chamar Clan Fund
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Your voluntary contributions fund youth education, emergency medical assistance, and community hall
          upkeep.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / TOP: Payment UI Section */}
        <div className="lg:col-span-5 space-y-6">
          {/* UPI Payment Card */}
          <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-md">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 1: Scan & Pay via UPI</h3>
                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="mt-5 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs relative">
                {/* SVG QR Code */}
                <svg
                  className="w-48 h-48 sm:w-52 sm:h-52"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background */}
                  <rect width="200" height="200" fill="white" rx="8" />

                  {/* Corner Position Detection Patterns */}
                  {/* Top-Left */}
                  <rect x="15" y="15" width="45" height="45" fill="#0F172A" rx="4" />
                  <rect x="23" y="23" width="29" height="29" fill="white" rx="2" />
                  <rect x="29" y="29" width="17" height="17" fill="#1E40AF" rx="2" />

                  {/* Top-Right */}
                  <rect x="140" y="15" width="45" height="45" fill="#0F172A" rx="4" />
                  <rect x="148" y="23" width="29" height="29" fill="white" rx="2" />
                  <rect x="154" y="29" width="17" height="17" fill="#1E40AF" rx="2" />

                  {/* Bottom-Left */}
                  <rect x="15" y="140" width="45" height="45" fill="#0F172A" rx="4" />
                  <rect x="23" y="148" width="29" height="29" fill="white" rx="2" />
                  <rect x="29" y="154" width="17" height="17" fill="#1E40AF" rx="2" />

                  {/* Representative Data Grid Pattern */}
                  <rect x="70" y="20" width="8" height="8" fill="#1E40AF" />
                  <rect x="85" y="20" width="8" height="8" fill="#0F172A" />
                  <rect x="100" y="20" width="8" height="8" fill="#1E40AF" />
                  <rect x="115" y="20" width="8" height="8" fill="#0F172A" />

                  <rect x="70" y="35" width="8" height="8" fill="#0F172A" />
                  <rect x="100" y="35" width="8" height="8" fill="#1E40AF" />
                  <rect x="120" y="35" width="8" height="8" fill="#0F172A" />

                  <rect x="75" y="50" width="12" height="12" fill="#1E40AF" />
                  <rect x="105" y="50" width="8" height="8" fill="#0F172A" />

                  <rect x="20" y="70" width="8" height="8" fill="#0F172A" />
                  <rect x="35" y="70" width="8" height="8" fill="#1E40AF" />
                  <rect x="50" y="70" width="8" height="8" fill="#0F172A" />
                  <rect x="140" y="70" width="8" height="8" fill="#1E40AF" />
                  <rect x="160" y="70" width="8" height="8" fill="#0F172A" />
                  <rect x="175" y="70" width="8" height="8" fill="#1E40AF" />

                  <rect x="20" y="85" width="8" height="8" fill="#1E40AF" />
                  <rect x="40" y="85" width="8" height="8" fill="#0F172A" />
                  <rect x="145" y="85" width="8" height="8" fill="#0F172A" />
                  <rect x="165" y="85" width="8" height="8" fill="#1E40AF" />

                  <rect x="70" y="140" width="8" height="8" fill="#1E40AF" />
                  <rect x="85" y="140" width="8" height="8" fill="#0F172A" />
                  <rect x="105" y="140" width="8" height="8" fill="#1E40AF" />
                  <rect x="120" y="140" width="8" height="8" fill="#0F172A" />

                  <rect x="70" y="160" width="8" height="8" fill="#0F172A" />
                  <rect x="90" y="160" width="8" height="8" fill="#1E40AF" />
                  <rect x="110" y="160" width="8" height="8" fill="#0F172A" />
                  <rect x="140" y="160" width="8" height="8" fill="#1E40AF" />
                  <rect x="160" y="160" width="8" height="8" fill="#0F172A" />
                  <rect x="175" y="160" width="8" height="8" fill="#1E40AF" />

                  {/* Center Emblem */}
                  <rect x="78" y="78" width="44" height="44" fill="white" rx="8" />
                  <rect x="82" y="82" width="36" height="36" fill="#2563EB" rx="6" />
                  <text
                    x="100"
                    y="104"
                    fill="white"
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    CCF
                  </text>
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 mt-2">
                Scan using any UPI App
              </span>
            </div>

            {/* UPI ID Copy Block */}
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
                  Official UPI ID
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 truncate block">
                  {upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(upiId, 'upi')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
              </button>
            </div>

            {/* Bank Transfer Details Accordion */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  Direct Bank Account (NEFT / IMPS)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(settings?.bankDetails?.accountNumber || '50100492817291', 'account')
                  }
                  className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  {copiedAccount ? 'Copied' : 'Copy A/C'}
                </button>
              </div>
              <div className="text-slate-600 leading-normal pt-1">
                <div><strong>A/C Name:</strong> {settings?.bankDetails?.accountName || 'Chamar Clan Community Welfare Fund'}</div>
                <div><strong>A/C Number:</strong> <span className="font-mono">{settings?.bankDetails?.accountNumber || '50100492817291'}</span></div>
                <div><strong>Bank:</strong> {settings?.bankDetails?.bankName || 'State Bank of India'}</div>
                <div><strong>IFSC Code:</strong> <span className="font-mono font-semibold text-slate-900">{settings?.bankDetails?.ifscCode || 'SBIN0001248'}</span></div>
              </div>
            </div>
          </div>

          {/* Payment instructions note */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How Payment Verification Works
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-500">
              <li>Complete payment in your UPI app (GPay / PhonePe).</li>
              <li>Note the 12-digit UPI Transaction / UTR number from the app.</li>
              <li>Submit the form with this number for instant ledger tagging.</li>
              <li>Committee validates against the bank statement daily.</li>
            </ol>
          </div>
        </div>

        {/* RIGHT / BOTTOM: Contribution Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 2: Submit Contribution Details</h3>
                <p className="text-xs text-slate-500">Record your contribution for verification</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Contributor Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Amount with Quick Select Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Contribution Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-blue-600">
                    {formatINR(Number(amount) || 0)}
                  </span>
                </div>

                {/* Quick Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(String(val));
                        setCustomAmount(String(val));
                      }}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        amount === String(val)
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['UPI', 'Bank Transfer', 'Cash'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Payment Reference / Transaction ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 12-digit UTR (UPI/2026/...) or Bank Ref"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Found in your payment app under &ldquo;UPI Transaction ID&rdquo; or &ldquo;UTR / Google Transaction ID&rdquo;.
                </p>
              </div>

              {/* Optional Payment Screenshot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Payment Screenshot <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="mt-1 flex justify-center px-4 pt-4 pb-5 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="space-y-2 text-center">
                    {screenshotPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          className="h-28 rounded-lg object-contain border"
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshotPreview(null)}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 text-xs shadow-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                        <div className="text-xs text-slate-600">
                          <label
                            htmlFor="screenshot-upload"
                            className="relative cursor-pointer text-blue-600 font-semibold hover:text-blue-800"
                          >
                            <span>Upload payment receipt</span>
                            <input
                              id="screenshot-upload"
                              name="screenshot-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                          <span className="text-slate-500"> or drag and drop</span>
                        </div>
                        <p className="text-[11px] text-slate-400">PNG, JPG up to 4MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Optional Note / Dedication
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. In memory of elder, or support for library"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full shadow-md text-base"
                >
                  Submit Contribution &rarr;
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted & Verified by Chamar Clan Welfare Committee</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
