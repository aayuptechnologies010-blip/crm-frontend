import { Phone, X, MessageCircle } from 'lucide-react';

export default function CallPanel({ lead, onClose }) {
  const phone = lead?.phone || '';
  const clean = phone.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-80 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-6 pt-8 pb-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
            {lead?.name?.charAt(0)?.toUpperCase()}
          </div>
          <p className="text-white font-bold text-base">{lead?.name}</p>
          <p className="text-slate-400 text-sm mt-0.5">{phone || 'No number'}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-6 flex flex-col gap-3">
          {phone ? (
            <>
              <a href={`tel:${phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-semibold transition-all active:scale-95 shadow-md">
                <Phone size={18} /> Call {phone}
              </a>
              <a href={`https://wa.me/${clean}`} target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-2xl text-sm font-semibold transition-all">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </>
          ) : (
            <p className="text-center text-sm text-gray-400 py-2">No phone number available.</p>
          )}
          <button onClick={onClose}
            className="text-gray-400 text-xs hover:text-gray-600 transition-colors text-center mt-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
