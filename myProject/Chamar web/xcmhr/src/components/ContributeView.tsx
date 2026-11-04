import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { formatCurrency } from '../utils/formatters';
import { ContributionCategory, PaymentMethod } from '../types';
import {
  QrCode,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  Building,
  HeartHandshake,
  Smartphone,
  CreditCard,
  Banknote,
  FileCheck2,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: ContributionCategory[] = [
  'General Welfare Fund',
  'Education & Scholarships',
  'Medical Emergency Relief',
  'Community Center Development',
  'Youth Career & Coaching',
  'Annual Sammelan & Cultural',
];

const PRESET_AMOUNTS = [500, 1100, 2100, 5100, 11000, 21000, 51000];

export const ContributeView: React.FC = () => {
  const { settings, addContribution, setSelectedReceipt, currentUser, addToast } = useCommunity();

  // Form State
  const [memberName, setMemberName] = useState(currentUser.isLoggedIn ? currentUser.name : '');
  const [mobile, setMobile] = useState(currentUser.mobile || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [gotraOrVillage, setGotraOrVillage] = useState('');
  const [amount, setAmount] = useState<number>(2100);
  const [customAmount, setCustomAmount] = useState<string>('2100');
  const [category, setCategory] = useState<ContributionCategory>('General Welfare Fund');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [utrOrRefNumber, setUtrOrRefNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptScreenshot, setReceiptScreenshot] = useState<string | undefined>(undefined);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');

  // UI helpers
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    const num = parseInt(val, 10);
    setAmount(isNaN(num) ? 0 : num);
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    addToast({
      type: 'info',
      title: 'UPI ID Copied',
      message: `${settings.upiId} copied to clipboard.`,
    });
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyBank = () => {
    const bankDetails = `A/C: ${settings.bankAccountNo}, IFSC: ${settings.bankIfsc}, Name: ${settings.upiPayeeName}, Bank: ${settings.bankName}`;
    navigator.clipboard.writeText(bankDetails);
    setCopiedBank(true);
    addToast({
      type: 'info',
      title: 'Bank Details Copied',
      message: 'Account details copied to clipboard.',
    });
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!memberName.trim()) errs.memberName = 'Name is required';
    if (!mobile.trim() || mobile.length < 10) errs.mobile = 'Valid 10-digit mobile is required';
    if (!amount || amount < 10) errs.amount = 'Minimum contribution is ₹10';
    if (!utrOrRefNumber.trim()) {
      errs.utrOrRefNumber =
        paymentMethod === 'UPI'
          ? 'UPI 12-digit UTR or Transaction ID is required'
          : 'Bank Transaction Ref / Cheque number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const newRecord = addContribution({
        memberName: memberName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        gotraOrVillage: gotraOrVillage.trim() || undefined,
        amount,
        category,
        paymentMethod,
        utrOrRefNumber: utrOrRefNumber.trim(),
        receiptScreenshot,
        notes: notes.trim() || undefined,
        status: currentUser.role === 'admin' ? 'verified' : 'pending',
      });

      // Show receipt modal
      setSelectedReceipt(newRecord);

      // Reset form (keep name/phone if member is logged in)
      setUtrOrRefNumber('');
      setNotes('');
      setReceiptScreenshot(undefined);
      setScreenshotFileName('');
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Submission Error',
        message: 'Could not record contribution. Please check form values.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate UPI Intent String
  const upiIntentString = `upi://pay?pa=${encodeURIComponent(
    settings.upiId
  )}&pn=${encodeURIComponent(settings.upiPayeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    'Chamar Community Fund - ' + category
  )}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
          <HeartHandshake className="w-4 h-4 text-blue-600" />
          <span>Community Contribution Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Support the Chamar Clan Community Fund
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Your voluntary contributions foster self-reliance, fund higher education scholarships,
          build community infrastructure, and offer a safety net for clan families in need.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Payment Channels & QR Scanner */}
        <div className="lg:col-span-5 space-y-6">
          {/* UPI Scan Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Scan & Pay via UPI</h3>
                  <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
                Instant
              </span>
            </div>

            {/* Dynamic QR Display */}
            <div className="my-5 flex flex-col items-center">
              <div className="p-3 bg-white border-2 border-blue-200 rounded-2xl shadow-sm text-center relative group">
                {/* SVG Visual QR Representation */}
                <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center relative">
                  <div className="w-full h-full border border-white/20 rounded grid grid-cols-5 grid-rows-5 gap-1.5 p-1.5">
                    <div className="col-span-2 row-span-2 bg-white rounded-sm flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-slate-900"></div>
                    </div>
                    <div className="bg-blue-400 rounded-sm"></div>
                    <div className="col-span-2 row-span-2 bg-white rounded-sm flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-slate-900"></div>
                    </div>
                    <div className="col-span-2 bg-white rounded-sm"></div>
                    <div className="bg-blue-300 rounded-sm"></div>
                    <div className="col-span-2 bg-white rounded-sm"></div>
                    <div className="col-span-2 row-span-2 bg-white rounded-sm flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-slate-900"></div>
                    </div>
                    <div className="bg-blue-400 rounded-sm"></div>
                    <div className="col-span-2 bg-white rounded-sm"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                      <span className="text-xs font-black">₹</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-extrabold text-blue-900 block font-mono">
                    {formatCurrency(amount || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    QR Auto-Amount Preset
                  </span>
                </div>
              </div>

              {/* UPI ID Click to Copy */}
              <div className="w-full mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                    Official UPI ID / VPA
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 truncate block">
                    {settings.upiId}
                  </span>
                </div>
                <button
                  id="copy-upi-btn"
                  type="button"
                  onClick={handleCopyUPI}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition shrink-0 ml-2"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center mt-2">
                Beneficiary: <strong className="text-slate-700">{settings.upiPayeeName}</strong>
              </p>
            </div>
          </div>

          {/* Bank Transfer Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Bank Account (NEFT / IMPS / RTGS)
                </h4>
              </div>
              <button
                id="copy-bank-btn"
                type="button"
                onClick={handleCopyBank}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
              >
                {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBank ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Account Name:</span>
                <span className="font-semibold text-slate-800 text-right">{settings.upiPayeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Name:</span>
                <span className="font-semibold text-slate-800">{settings.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-blue-900">{settings.bankAccountNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IFSC Code:</span>
                <span className="font-mono font-bold text-blue-900">{settings.bankIfsc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch:</span>
                <span className="text-slate-700 text-right">{settings.bankBranch}</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Payment Instructions */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 text-xs space-y-2">
            <h5 className="font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>3-Step Contribution Guide</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>Open any UPI app or Net Banking, scan QR or send to the UPI ID / Account.</li>
              <li>Complete payment and copy the <strong>12-digit UTR / Reference Number</strong>.</li>
              <li>Fill out the form on the right and submit to generate your verified digital receipt.</li>
            </ol>
          </div>
        </div>

        {/* Right Column (7 cols): Contribution Submission Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-100">
          <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Member Contribution Form</h2>
              <p className="text-xs text-slate-500">
                Please enter your details to receive an official receipt.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              Official Entry
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Donor Identification */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                1. Contributor Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="contribute-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Chamar"
                    value={memberName}
                    onChange={(e) => {
                      setMemberName(e.target.value);
                      if (errors.memberName) setErrors((prev) => ({ ...prev, memberName: '' }));
                    }}
                    className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.memberName ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                    }`}
                  />
                  {errors.memberName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.memberName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs font-medium text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl">
                      +91
                    </span>
                    <input
                      id="contribute-mobile"
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, ''));
                        if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                      }}
                      className={`w-full px-3.5 py-2 text-sm border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono ${
                        errors.mobile ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.mobile}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clan Branch / Gotra / Village (Optional)
                  </label>
                  <input
                    id="contribute-village"
                    type="text"
                    placeholder="e.g. Kardam / Meerut or Gautam / Agra"
                    value={gotraOrVillage}
                    onChange={(e) => setGotraOrVillage(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="contribute-email"
                    type="email"
                    placeholder="for digital copy e.g. name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Contribution Amount & Category */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                2. Select Amount & Purpose
              </span>

              {/* Amount Presets Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Preset Amount (₹)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        amount === amt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Or Enter Custom Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-sm font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      id="contribute-amount"
                      type="text"
                      required
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className={`w-full pl-8 pr-3.5 py-2 text-sm font-bold text-slate-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono ${
                        errors.amount ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contribution Cause / Category *
                  </label>
                  <select
                    id="contribute-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ContributionCategory)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Verification & Reference */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                3. Payment Confirmation Details
              </span>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Method Used *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Net Banking', 'Cash / Cheque'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === method
                          ? 'bg-blue-50 text-blue-800 border-blue-600 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-blue-600" />}
                      {method === 'Net Banking' && <CreditCard className="w-3.5 h-3.5 text-blue-600" />}
                      {method === 'Cash / Cheque' && <Banknote className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {paymentMethod === 'UPI'
                    ? '12-Digit UPI UTR / Transaction ID *'
                    : 'Bank Transaction Reference / Cheque No. *'}
                </label>
                <input
                  id="contribute-utr"
                  type="text"
                  required
                  placeholder={
                    paymentMethod === 'UPI'
                      ? 'e.g. 428901284912 (found in your Google Pay/PhonePe receipt)'
                      : 'e.g. NEFT-SBI89201948 or Cheque #102938'
                  }
                  value={utrOrRefNumber}
                  onChange={(e) => {
                    setUtrOrRefNumber(e.target.value);
                    if (errors.utrOrRefNumber)
                      setErrors((prev) => ({ ...prev, utrOrRefNumber: '' }));
                  }}
                  className={`w-full px-3.5 py-2 text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.utrOrRefNumber ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.utrOrRefNumber && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.utrOrRefNumber}</p>
                )}
              </div>

              {/* Upload Screenshot / Receipt */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Payment Screenshot / Receipt (Optional)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400 transition bg-slate-50/50">
                  {receiptScreenshot ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-left">
                        <img
                          src={receiptScreenshot}
                          alt="Screenshot preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                            {screenshotFileName || 'Payment_receipt.jpg'}
                          </p>
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Screenshot Attached
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptScreenshot(undefined);
                          setScreenshotFileName('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        id="screenshot-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center pointer-events-none">
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <p className="text-xs font-medium text-slate-700">
                          Click or drag and drop payment screenshot
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, WebP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal Note or Dedication (Optional)
                </label>
                <textarea
                  id="contribute-notes"
                  rows={2}
                  placeholder="e.g. In memory of late Shri ..., for student library books fund, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                id="submit-contribution-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-blue-200" />
                <span>
                  {isSubmitting
                    ? 'Submitting...'
                    : `Submit Contribution of ${formatCurrency(amount || 0)}`}
                </span>
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                Upon submission, a digital receipt with a serial number will be generated immediately.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
