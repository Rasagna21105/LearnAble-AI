import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFiles, createLesson } from "./api";
import "./shared.css";
import "./UploadLesson.css";

const SUBJECTS = ["Science", "Mathematics", "English", "History", "Geography"];

const UploadLesson = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title:       "",
    subject:     "Science",
    description: "",
    mode:        "both",
    textContent: "",
  });
  const [pdfFile,   setPdfFile]   = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [step,      setStep]      = useState(1); // 1 = details, 2 = files, 3 = review

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) { setError("Lesson title is required."); return; }

    const needsBlind = form.mode === "blind" || form.mode === "both";
    const needsDeaf  = form.mode === "deaf"  || form.mode === "both";

    if (needsBlind && !pdfFile && !form.textContent.trim()) {
      setError("For Blind mode, please upload a PDF or enter text content.");
      return;
    }
    if (needsDeaf && !videoFile) {
      setError("For Deaf mode, please upload a video file.");
      return;
    }

    setLoading(true);
    try {
      let pdfUrl = "";
      let videoUrl = "";
    
      if (pdfFile || videoFile) {
        const fd = new FormData();
        if (pdfFile) fd.append("pdf", pdfFile);
        if (videoFile) fd.append("video", videoFile);
    
        console.log("Uploading files...");
        const uploaded = await uploadFiles(fd);
        console.log("Upload response:", uploaded);
    
        if (uploaded.error) {
          setError(uploaded.error);
          setLoading(false);
          return;
        }
    
        pdfUrl = uploaded.pdfUrl || "";
        videoUrl = uploaded.videoUrl || "";
      }
    
      console.log("Creating lesson...");
      const res = await createLesson({
        ...form,
        pdfUrl,
        videoUrl,
      });
    
      console.log("Lesson response:", res);

      if (res._id) {
        setSuccess("Lesson uploaded successfully!");
        setTimeout(() => navigate("/teacher/manage"), 1800);
      } else {
        setError(res.message || "Failed to create lesson.");
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  const modeLabel = (m) =>
    m === "blind" ? "👁️ Blind Mode only"
    : m === "deaf" ? "🤟 Deaf Mode only"
    : "👁️🤟 Both Modes";

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">⬆️ Upload Lesson — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-white" onClick={() => navigate("/teacher/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="upload-body">
        {/* Step indicator */}
        <div className="upload-steps">
          {["Lesson Details", "Upload Files", "Review & Submit"].map((label, i) => (
            <React.Fragment key={i}>
              <div
                className={`step-pill ${step === i + 1 ? "step-active" : step > i + 1 ? "step-done" : ""}`}
                onClick={() => { if (step > i + 1) setStep(i + 1); }}
              >
                <span className="step-num">{step > i + 1 ? "✓" : i + 1}</span>
                {label}
              </div>
              {i < 2 && <div className={`step-line ${step > i + 1 ? "step-line-done" : ""}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {error   && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          {/* ---- STEP 1: Details ---- */}
          {step === 1 && (
            <div className="upload-card card">
              <h2 className="upload-section-title">📝 Lesson Details</h2>

              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Chapter 1: Introduction to Science"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} className="form-select">
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Available For *</label>
                  <select name="mode" value={form.mode} onChange={handleChange} className="form-select">
                    <option value="both">Both Modes</option>
                    <option value="blind">Blind Mode only</option>
                    <option value="deaf">Deaf Mode only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description of what this lesson covers..."
                  value={form.description}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Text Content (for Blind mode TTS)</label>
                <textarea
                  name="textContent"
                  placeholder="Paste or type the lesson content here. Students in Blind mode will hear this read aloud..."
                  value={form.textContent}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={6}
                />
                <p className="form-hint">You can also upload a PDF below. If both are provided, text takes priority for audio.</p>
              </div>

              <div className="upload-nav">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (!form.title.trim()) { setError("Please enter a lesson title."); return; }
                    setError("");
                    setStep(2);
                  }}
                >
                  Next: Upload Files →
                </button>
              </div>
            </div>
          )}

          {/* ---- STEP 2: Files ---- */}
          {step === 2 && (
            <div className="upload-card card">
              <h2 className="upload-section-title">📁 Upload Files</h2>
              <p className="upload-mode-note">
                Mode selected: <strong>{modeLabel(form.mode)}</strong>
              </p>

              {/* PDF upload */}
              {(form.mode === "blind" || form.mode === "both") && (
                <div className="file-upload-zone">
                  <p className="file-zone-label">📄 PDF File <span className="mode-req">(Blind Mode)</span></p>
                  <p className="file-zone-sub">Upload a PDF of the lesson. It will be available for download and the text will be extracted for audio.</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="file-input"
                    id="pdf-input"
                  />
                  <label htmlFor="pdf-input" className="file-label">
                    {pdfFile ? `✅ ${pdfFile.name}` : "Choose PDF file"}
                  </label>
                  {pdfFile && (
                    <button type="button" className="file-remove" onClick={() => setPdfFile(null)}>✕ Remove</button>
                  )}
                </div>
              )}

              {/* Video upload */}
              {(form.mode === "deaf" || form.mode === "both") && (
                <div className="file-upload-zone">
                  <p className="file-zone-label">🎬 Video File <span className="mode-req">(Deaf Mode)</span></p>
                  <p className="file-zone-sub">Upload a video lesson (MP4, MOV, WebM). Max size: 200 MB. Students in Deaf mode will watch this with captions.</p>
                  <input
                    type="file"
                    accept="video/mp4,video/mov,video/webm,.mov,.mp4,.webm"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="file-input"
                    id="video-input"
                  />
                  <label htmlFor="video-input" className="file-label">
                    {videoFile ? `✅ ${videoFile.name}` : "Choose video file"}
                  </label>
                  {videoFile && (
                    <button type="button" className="file-remove" onClick={() => setVideoFile(null)}>✕ Remove</button>
                  )}
                </div>
              )}

              <div className="upload-nav">
                <button type="button" className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn-primary" onClick={() => { setError(""); setStep(3); }}>
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {/* ---- STEP 3: Review ---- */}
          {step === 3 && (
            <div className="upload-card card">
              <h2 className="upload-section-title">✅ Review & Submit</h2>

              <div className="review-table">
                <div className="review-row">
                  <span className="review-key">Title</span>
                  <span className="review-val">{form.title}</span>
                </div>
                <div className="review-row">
                  <span className="review-key">Subject</span>
                  <span className="review-val">{form.subject}</span>
                </div>
                <div className="review-row">
                  <span className="review-key">Mode</span>
                  <span className="review-val">{modeLabel(form.mode)}</span>
                </div>
                <div className="review-row">
                  <span className="review-key">Description</span>
                  <span className="review-val">{form.description || "—"}</span>
                </div>
                <div className="review-row">
                  <span className="review-key">Text Content</span>
                  <span className="review-val">
                    {form.textContent.trim() ? `${form.textContent.slice(0, 80)}...` : "—"}
                  </span>
                </div>
                <div className="review-row">
                  <span className="review-key">PDF File</span>
                  <span className="review-val">{pdfFile ? pdfFile.name : "—"}</span>
                </div>
                <div className="review-row">
                  <span className="review-key">Video File</span>
                  <span className="review-val">{videoFile ? videoFile.name : "—"}</span>
                </div>
              </div>

              <div className="upload-nav">
                <button type="button" className="btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn-primary upload-submit-btn" disabled={loading}>
                  {loading ? "Uploading..." : "Upload Lesson"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadLesson;