import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ChevronRight, DownloadCloud, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { PrimaryButton, SecondaryButton } from './FormElements';
import { useData } from '../../context/DataContext';

const STEPS = ['upload', 'preview', 'done'];

const SAMPLE_CSV = `Name,Email,Phone,Company,Source,Status,Lead Type,Deal Value
Rahul Sharma,rahul@example.com,9876543210,TechCorp Pvt Ltd,LinkedIn,New,Client Project,50000
Priya Patel,priya@college.edu,9123456789,IIT Delhi,Referral,Contacted,Student Training,15000
Amit Kumar,amit@startup.io,9988776655,StartupXYZ,Website,Qualified,Client Project,120000`;

export default function LeadImportModal({ isOpen, onClose }) {
  const { importLeadsPreview, importLeadsConfirm } = useData();

  const [step, setStep] = useState('upload'); // upload | preview | done
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null); // { totalRows, previewRows, detectedColumns, filePath }
  const [result, setResult] = useState(null);   // { imported, skipped }
  const fileInputRef = useRef();

  const reset = () => {
    setStep('upload');
    setFile(null);
    setDragging(false);
    setLoading(false);
    setError('');
    setPreview(null);
    setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileSelect = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Only CSV, XLSX, or XLS files are supported.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFileSelect(f);
  }, []);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await importLeadsPreview(file);
      setPreview(data);
      setStep('preview');
    } catch (err) {
      setError(err.message || 'An error occurred while parsing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview?.filePath) return;
    setLoading(true);
    setError('');
    try {
      const data = await importLeadsConfirm(preview.filePath);
      setResult(data);
      setStep('done');
    } catch (err) {
      setError(err.message || 'An error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Leads from CSV" size="lg">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {['Upload File', 'Preview', 'Done'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
              i === stepIndex ? 'text-blue-600' : i < stepIndex ? 'text-green-600' : 'text-gray-400'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < stepIndex ? 'bg-green-500 border-green-500 text-white' :
                i === stepIndex ? 'bg-blue-600 border-blue-600 text-white' :
                'border-gray-300 text-gray-400'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </span>
              {label}
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 rounded ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* ── STEP 1: Upload ── */}
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Sample CSV download */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Not sure about the format?</span>
              <span className="text-blue-600 ml-1">Download a sample CSV (also opens in Excel)</span>
            </div>
            <button
              onClick={downloadSample}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 rounded-lg px-3 py-1.5 transition-all hover:shadow-sm"
            >
              <DownloadCloud size={13} /> Sample CSV
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${
              dragging
                ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            {file ? (
              <>
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <FileText size={28} className="text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }}
                  className="text-xs text-red-500 hover:text-red-600 underline mt-1"
                >
                  Remove, choose another file
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Upload size={26} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Drop your CSV / Excel file here</p>
                  <p className="text-sm text-gray-400 mt-0.5">or click to browse (CSV, XLSX, XLS — max 10 MB)</p>
                </div>
              </>
            )}
          </div>

          {/* Required columns info */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
            <p className="font-semibold mb-1">📋 Required column: <code className="bg-amber-100 px-1 rounded">Name</code></p>
            <p>✅ Supported formats: <strong>CSV, Excel (.xlsx, .xls)</strong></p>
            <p className="mt-1">Optional columns: Email, Phone, Company, Source, Status, Lead Type, Deal Value, Assigned To, Follow Up Date, Course, Branch, College, Year, Training Type, Project Type, Tech Stack, Timeline</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={handlePreview}
              disabled={!file || loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
              {loading ? 'Parsing...' : 'Preview'}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* ── STEP 2: Preview ── */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg border border-blue-100">
              <FileText size={14} /> {preview.totalRows} leads found
            </div>
            <div className="text-gray-500">
              Detected columns: <span className="font-medium text-gray-700">{preview.detectedColumns.join(', ')}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">Showing a preview of the first 10 rows — click <strong>Import Now</strong> to proceed:</p>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">#</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Name</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Phone</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Company</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Source</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.previewRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-gray-400">{row.rowIndex}</td>
                    <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{row.name || <span className="text-red-400 italic">missing</span>}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.phone || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.company || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.source || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.status === 'Won' ? 'bg-green-100 text-green-700' :
                        row.status === 'Lost' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{row.status}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.leadType === 'Student Training' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{row.leadType}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.totalRows > 10 && (
            <p className="text-xs text-gray-400 text-center">...and {preview.totalRows - 10} more rows will also be imported</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <SecondaryButton onClick={() => { setStep('upload'); setPreview(null); setError(''); }}>
              ← Back
            </SecondaryButton>
            <PrimaryButton
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {loading ? 'Importing...' : `Import ${preview.totalRows} Leads`}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* ── STEP 3: Done ── */}
      {step === 'done' && result && (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={42} className="text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">Import Successful! 🎉</h3>
            <p className="text-gray-500 mt-1 text-sm">Leads have been added to your CRM successfully</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{result.imported}</p>
              <p className="text-xs text-gray-500 mt-1">Imported</p>
            </div>
            {result.skipped > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{result.skipped}</p>
                <p className="text-xs text-gray-500 mt-1">Skipped (no name)</p>
              </div>
            )}
          </div>
          <PrimaryButton onClick={handleClose} className="mt-2">
            Done ✓
          </PrimaryButton>
        </div>
      )}
    </Modal>
  );
}
