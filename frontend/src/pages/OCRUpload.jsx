import { useState } from 'react';
import { Upload, FileImage, FileText, Languages, Loader2, Send, Save, X } from 'lucide-react';
import api from '../lib/api';

const BRANCHES = ['all', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'IT', 'Chemical'];
const YEARS = ['all', '2025', '2026', '2027', '2028', '2029'];
const CATEGORIES = ['academic', 'exam', 'event', 'placement', 'general'];

const OCRUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hindiText, setHindiText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [targetBranch, setTargetBranch] = useState('all');
  const [targetYear, setTargetYear] = useState('all');

  const isPDF = (f) => f?.type === 'application/pdf' || f?.name?.toLowerCase().endsWith('.pdf');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(isPDF(selected) ? 'pdf' : URL.createObjectURL(selected));
      setHindiText('');
      setEnglishText('');
      setPosted(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setPreview(isPDF(dropped) ? 'pdf' : URL.createObjectURL(dropped));
      setHindiText('');
      setEnglishText('');
      setPosted(false);
    }
  };

  const processOCR = async () => {
    if (!file) return;
    try {
      setProcessing(true);
      setProgress(20);

      const formData = new FormData();
      formData.append('image', file);

      setProgress(40);
      const { data } = await api.post('/notices/ocr-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProgress(100);
      setHindiText(data.hindi_text || '');
      setEnglishText(data.english_text || '');
      setImageUrl(data.image_url || '');
    } catch (err) {
      console.error('OCR failed:', err);
      alert('OCR processing failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const handlePost = async (status = 'active') => {
    if (!title.trim()) {
      alert('Please enter a title for the notice.');
      return;
    }
    try {
      setPosting(true);
      const targetCriteria = {};
      if (targetBranch !== 'all') targetCriteria.branch = targetBranch;
      if (targetYear !== 'all') targetCriteria.year = targetYear;
      if (!targetCriteria.branch && !targetCriteria.year) targetCriteria.global = true;

      await api.post('/notices/manual', {
        title,
        content: englishText || hindiText,
        category,
        original_image_url: imageUrl,
        target_criteria: targetCriteria,
        status,
      });

      setPosted(true);
    } catch (err) {
      console.error('Post failed:', err);
      alert('Failed to post notice.');
    } finally {
      setPosting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setHindiText('');
    setEnglishText('');
    setImageUrl('');
    setTitle('');
    setPosted(false);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>OCR Upload & Translation</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Upload a Hindi notice (image or PDF), extract text, translate, and post</p>

      {posted ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Notice Posted!</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Your OCR notice has been published successfully.</p>
          <button onClick={reset} className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Upload Another
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & Preview */}
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="glass-card p-8 text-center cursor-pointer"
              onClick={() => document.getElementById('ocrFileInput').click()}
            >
              <input id="ocrFileInput" type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={handleFileChange} />
              <FileImage className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Drop your Hindi notice here</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Supports images (JPG, PNG) and PDF files</p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Preview</span>
                  <button onClick={reset} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--text-muted)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {preview === 'pdf' ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)' }}>
                    <FileText className="w-10 h-10 flex-shrink-0 text-red-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file?.size / 1024).toFixed(1)} KB • PDF Document</p>
                    </div>
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="w-full rounded-lg border" style={{ borderColor: 'var(--border-color)' }} />
                )}
                <button
                  onClick={processOCR}
                  disabled={processing}
                  className="mt-4 w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {processing ? 'Processing...' : (preview === 'pdf' ? 'Extract Text (PDF)' : 'Extract Text (OCR)')}
                </button>

                {processing && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      <span>OCR Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bg-hover)' }}>
                      <div className="bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Text results & Posting */}
          <div className="space-y-4">
            {/* Hindi text */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Languages className="w-4 h-4" /> Extracted Hindi Text (OCR)
                </label>
              </div>
              <textarea
                value={hindiText}
                onChange={(e) => setHindiText(e.target.value)}
                rows={6}
                placeholder="Hindi text will appear here after OCR processing..."
                className="w-full rounded-lg border p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-500/30"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* English translation */}
            <div className="glass-card p-4">
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>English Translation</label>
              <textarea
                value={englishText}
                onChange={(e) => setEnglishText(e.target.value)}
                rows={6}
                placeholder="English translation will appear here..."
                className="w-full rounded-lg border p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-500/30"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Post section */}
            {(hindiText || englishText) && (
              <div className="glass-card p-4 space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notice title..."
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />

                <div className="grid grid-cols-3 gap-3">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                  <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b === 'all' ? 'All Branches' : b}</option>)}
                  </select>
                  <select value={targetYear} onChange={(e) => setTargetYear(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {YEARS.map(y => <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handlePost('draft')} disabled={posting}
                    className="flex-1 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    <Save className="w-4 h-4" /> Save as Draft
                  </button>
                  <button onClick={() => handlePost('active')} disabled={posting}
                    className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Post Notice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRUpload;
