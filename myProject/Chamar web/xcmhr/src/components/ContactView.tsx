import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const { settings, addToast } = useCommunity();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !message.trim()) {
      addToast({
        type: 'error',
        title: 'Form Incomplete',
        message: 'Please fill in your name, mobile, and message.',
      });
      return;
    }

    setIsSent(true);
    addToast({
      type: 'success',
      title: 'Message Received',
      message: `Thank you, ${name}. A committee representative will get back to you shortly.`,
    });

    setName('');
    setMobile('');
    setMessage('');
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Community Helpdesk & Grievance Redressal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch with Committee Office
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Have questions regarding contributions, student aid applications, or community bhawan
          booking? Contact our dedicated committee representatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Contact Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-100 space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Registered Office & Helpline
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Registered Address</span>
                  <p className="mt-0.5 leading-relaxed text-slate-600">
                    {settings.registeredAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Helpline & WhatsApp</span>
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="mt-0.5 block font-mono text-blue-700 font-semibold hover:underline"
                  >
                    {settings.contactPhone}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Available 9:00 AM - 8:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Official Email</span>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="mt-0.5 block text-blue-700 hover:underline"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Community Office Hours</span>
                  <p className="mt-0.5 text-slate-600">Monday to Saturday: 10:00 AM – 6:00 PM</p>
                  <p className="text-slate-600">Sunday: Open by appointment for committee meetings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              <h4 className="text-sm font-bold text-white">Need Medical Emergency Grant?</h4>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              If a clan member faces an urgent hospital emergency, contact our Welfare Secretary
              directly on <span className="font-mono font-bold text-white">+91 98778 90123</span> for
              fast-track committee approval.
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Send a Message to the Committee</h3>
          <p className="text-xs text-slate-500 mb-5">
            Submit your feedback, query, or proposal directly to the executive committee.
          </p>

          {isSent ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Message Delivered</h4>
              <p className="text-xs text-emerald-700">
                Thank you for contacting the committee. Your query has been logged.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl">
                      +91
                    </span>
                    <input
                      id="contact-mobile"
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Category *
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Contribution / Receipt Query">Contribution / Receipt Query</option>
                  <option value="Student Scholarship Application">Student Scholarship Application</option>
                  <option value="Emergency Medical Assistance">Emergency Medical Assistance</option>
                  <option value="Community Bhawan Booking">Community Bhawan Booking</option>
                  <option value="Volunteer with Committee">Volunteer with Committee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Details *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Please describe your query or assistance needed..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Query to Committee</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <h5 className="font-bold text-slate-900">How do I verify that my money reached the fund?</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Every contribution submitted with a UTR generates an instant receipt number. Within
              24-48 hours, the Treasurer verifies the bank statement, after which it appears with a
              green "Verified" badge on the public directory.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <h5 className="font-bold text-slate-900">Who can apply for student coaching scholarships?</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Any student belonging to the Chamar community who has cleared class 12th with merit or
              is preparing for civil services, medical, engineering, or law entrance exams can apply
              through the scholarship application form.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <h5 className="font-bold text-slate-900">Can I contribute anonymously?</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Yes, you can write "Well Wisher" in the name field, though for transparent society
              audits, we encourage members to provide their name and native location.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <h5 className="font-bold text-slate-900">How often are committee financial audits held?</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              A certified Chartered Accountant audits our records annually before the Annual General
              Meeting, and monthly internal audits are conducted by the Comptroller Smt. Pushpa Devi
              Bharti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
