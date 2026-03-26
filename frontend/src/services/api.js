/**
 * ATS Resume Analyzer — API service
 * All requests go to /api/* which Vite proxies to http://localhost:8000
 */

/**
 * Upload a PDF resume and job description for ATS scoring.
 * @param {File} file        - The PDF file to analyze
 * @param {string} jobDesc   - The job description text
 * @returns {Promise<Object>} - { id, filename, ats_score, feedback, missing_keywords, created_at }
 */
export async function analyzeResume(file, jobDesc) {
  const form = new FormData();
  form.append('resume', file);
  form.append('job_desc', jobDesc);

  const res = await fetch('/api/analyze', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `Server error ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch all past resume analyses, newest first.
 * @returns {Promise<Array>}
 */
export async function getHistory() {
  const res = await fetch('/api/history');
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
  return res.json();
}
