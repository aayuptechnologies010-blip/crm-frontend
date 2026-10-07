import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Receipt } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card from '../components/shared/Card';
import { PrimaryButton, SecondaryButton } from '../components/shared/FormElements';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get('print') === 'true';

  const { invoices } = useData();
  const invoice = invoices.find(inv => (inv._id === id || inv.id === id));

  useEffect(() => {
    if (invoice && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
        navigate('/invoices');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [invoice, autoPrint, navigate]);

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-red-500 font-semibold">Invoice not found!</p>
        <SecondaryButton onClick={() => navigate('/invoices')} className="mt-4">
          <ArrowLeft size={14} /> Back to Invoices
        </SecondaryButton>
      </div>
    );
  }

  const amount = invoice.amount || 0;
  const item1Val = Math.round(amount * 0.7);
  const item2Val = Math.round(amount * 0.2);
  const item3Val = Math.round(amount * 0.1);
  const tax = Math.round(amount * 0.18);
  const grandTotal = amount + tax;

  const dueDate = invoice.dueDate ||
    (invoice.issueDate
      ? new Date(new Date(invoice.issueDate).getTime() + 15 * 86400000).toISOString().split('T')[0]
      : '—');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-document, #invoice-document * { visibility: visible; }
          #invoice-document { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none !important; border: none !important; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Invoices
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          <SecondaryButton onClick={() => window.print()} className="flex-1 sm:flex-initial">
            <Printer size={16} /> Print Invoice
          </SecondaryButton>
          <PrimaryButton onClick={() => window.print()} className="flex-1 sm:flex-initial">
            <Download size={16} /> Save PDF
          </PrimaryButton>
        </div>
      </div>

      <div id="invoice-document" className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Receipt size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-800">Sales CRM</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Sales CRM Private Limited</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">
              Plot 24, Sector 62, Noida,<br />
              Uttar Pradesh - 201301, India<br />
              GSTIN: 09AAXCA1209B1Z8
            </p>
          </div>
          <div className="sm:text-right flex flex-col justify-between">
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                invoice.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                invoice.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>{invoice.status}</span>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mt-3">INVOICE</h1>
              <p className="text-sm font-semibold text-gray-600 mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-gray-100">
          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h5>
            <p className="font-bold text-gray-800 text-base">{invoice.client}</p>
            <p className="text-sm text-gray-600 mt-1 font-semibold">{invoice.contact}</p>
          </div>
          <div className="sm:text-right space-y-2">
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Issued</h5>
              <p className="text-sm font-semibold text-gray-700">{invoice.issueDate || '—'}</p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</h5>
              <p className="text-sm font-semibold text-gray-700">{dueDate}</p>
            </div>
          </div>
        </div>

        <div className="py-8 text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Qty</th>
                <th className="pb-3 text-right">Rate</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 pr-3">
                  <div className="font-semibold text-gray-800">Enterprise CRM Implementation & Setup</div>
                  <div className="text-xs text-gray-400 mt-0.5">Platform configuration, cloud deployment, and team onboarding.</div>
                </td>
                <td className="py-4 text-right text-sm text-gray-600">1</td>
                <td className="py-4 text-right text-sm text-gray-700 font-semibold">₹{item1Val.toLocaleString()}</td>
                <td className="py-4 text-right text-sm text-gray-800 font-bold">₹{item1Val.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-4 pr-3">
                  <div className="font-semibold text-gray-800">Premium Support Plan (Annual)</div>
                  <div className="text-xs text-gray-400 mt-0.5">24/7 priority support, SLA coverage, and dedicated account manager.</div>
                </td>
                <td className="py-4 text-right text-sm text-gray-600">1</td>
                <td className="py-4 text-right text-sm text-gray-700 font-semibold">₹{item2Val.toLocaleString()}</td>
                <td className="py-4 text-right text-sm text-gray-800 font-bold">₹{item2Val.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-4 pr-3">
                  <div className="font-semibold text-gray-800">Consultancy & Custom Reports Integration</div>
                  <div className="text-xs text-gray-400 mt-0.5">Tailored dashboard design and business intelligence reporting setup.</div>
                </td>
                <td className="py-4 text-right text-sm text-gray-600">1</td>
                <td className="py-4 text-right text-sm text-gray-700 font-semibold">₹{item3Val.toLocaleString()}</td>
                <td className="py-4 text-right text-sm text-gray-800 font-bold">₹{item3Val.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-6 border-t border-gray-100 pt-8">
          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h5>
            <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <p><span className="font-semibold text-gray-700">Bank Name:</span> HDFC Bank Ltd</p>
              <p><span className="font-semibold text-gray-700">A/c Holder:</span> Sales CRM Private Limited</p>
              <p><span className="font-semibold text-gray-700">A/c Number:</span> 50200084729104</p>
              <p><span className="font-semibold text-gray-700">IFSC Code:</span> HDFC0001203</p>
              <p><span className="font-semibold text-gray-700">Branch:</span> Sector 62, Noida</p>
            </div>
          </div>
          <div className="sm:text-right min-w-[240px] space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (GST 18%)</span>
              <span className="font-semibold">₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold text-gray-800">
              <span>Grand Total</span>
              <span className="text-blue-600">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-12 border-t border-gray-100 mt-8">
          <div className="text-xs text-gray-400 max-w-sm">
            <p className="font-bold text-gray-500 mb-1">Terms & Conditions</p>
            <p>1. Please pay within 15 days of invoice date.</p>
            <p>2. Interest @18% p.a. will be charged for overdue payments.</p>
            <p>3. This is a computer-generated invoice and requires no signature.</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="inline-block border-b border-gray-300 w-40 pb-12 mb-2 relative">
              <span className="absolute bottom-1 right-2 text-[10px] text-gray-300 tracking-widest font-mono">SEAL</span>
            </div>
            <p className="text-xs font-bold text-gray-800">Authorized Signatory</p>
            <p className="text-[10px] text-gray-400">Sales CRM Private Limited</p>
          </div>
        </div>
      </div>
    </div>
  );
}
