/**
 * ATS Resume Analyzer — API service
 * All requests go to /api/* which Vite proxies to http://localhost:8000
 */

/** Matches MAX_UPLOAD_BYTES in backend/app/utils/upload.py. */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Read an error body and throw it as an Error carrying the HTTP status, so
 * callers can distinguish "your input was wrong" from "the service is down".
 */
async function raiseForStatus(res) {
  const body = await res.json().catch(() => ({}));
  const err = new Error(body.detail || `Server error ${res.status}`);
  err.status = res.status;
  throw err;
}

function resumeForm(file, jobDesc) {
  const form = new FormData();
  form.append('resume', file);
  form.append('job_desc', jobDesc);
  return form;
}

/**
 * Full AI analysis. Requires the Gemini API to be reachable.
 * @returns {Promise<Object>} { id, filename, ats_score, feedback, missing_keywords,
 *                              created_at, keyword_score }
 */
export async function analyzeResume(file, jobDesc) {
  const res = await fetch('/api/analyze', { method: 'POST', body: resumeForm(file, jobDesc) });
  if (!res.ok) await raiseForStatus(res);
  return res.json();
}

/**
 * Deterministic keyword score. Makes no external call, so it still answers when
 * the model API is unavailable.
 * @returns {Promise<Object>} { filename, score, matched_keywords, missing_keywords,
 *                              resume_skills, total_jd_skills, matched_weight,
 *                              total_weight, breakdown }
 */
export async function keywordScore(file, jobDesc) {
  const res = await fetch('/api/keyword-score', { method: 'POST', body: resumeForm(file, jobDesc) });
  if (!res.ok) await raiseForStatus(res);
  return res.json();
}

/**
 * Fetch past resume analyses, newest first.
 */
export async function getHistory() {
  const res = await fetch('/api/history');
  if (!res.ok) await raiseForStatus(res);
  return res.json();
}
