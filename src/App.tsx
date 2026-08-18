import { useState, useRef, useCallback, useEffect } from "react"

type AppState = "idle" | "uploaded" | "analyzing" | "results" | "error"

interface FileInfo {
  name: string
  size: number
  url: string
}

const CLASSES = [
  { label: "Glioma Tumor", value: 96.8, color: "#ef4444" },
  { label: "Meningioma Tumor", value: 1.7, color: "#f59e0b" },
  { label: "Pituitary Tumor", value: 0.9, color: "#8b5cf6" },
  { label: "No Tumor", value: 0.6, color: "#10b981" },
]

const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const MAX_SIZE = 10 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function BrainIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 6C17.4 6 12 11.4 12 18C12 19.5 12.3 20.9 12.8 22.2C10.6 23.2 9 25.5 9 28C9 31.7 12 34.7 15.7 35C16.7 39 20.3 42 24.5 42C25.3 42 26 41.3 26 40.5V39C28.6 38.3 30.6 36.2 31.2 33.6C34.4 32.8 36.7 29.9 36.7 26.5C36.7 25.2 36.3 23.9 35.7 22.8C37 21.3 38 19.2 38 17C38 11 31.7 6 24 6Z"
        fill="#0891b2"
        fillOpacity="0.15"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 22C18 20.3 19.3 19 21 19"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24 16V20"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M28 24C28 26.2 26.2 28 24 28"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="2.5" fill="#0891b2" fillOpacity="0.6" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.667 21.333C7.720 21.333 5.333 18.947 5.333 16C5.333 13.387 7.187 11.2 9.667 10.747C9.627 10.507 9.6 10.253 9.6 10C9.6 7.6 11.6 5.6 14 5.6C15.253 5.6 16.4 6.12 17.213 6.973C18.013 5.773 19.387 5 20.933 5C23.333 5 25.333 7 25.333 9.4C25.333 9.6 25.32 9.8 25.293 10H25.333C27.547 10 29.333 11.787 29.333 14C29.333 16.213 27.547 18 25.333 18H21.333"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 18.667L16 29.333"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 22.667L16 18.667L20 22.667"
        stroke="#0891b2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Spinner() {
  return (
    <div className="relative w-16 h-16 mx-auto mb-6">
      <div className="absolute inset-0 rounded-full border-2 border-cyan-100" />
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-600"
        style={{ animation: "spin 1s linear infinite" }}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="absolute inset-0 flex items-center justify-center">
        <BrainIcon size={28} />
      </div>
    </div>
  )
}

function HeatmapOverlay({ src }: { src: string }) {
  return (
    <div className="relative w-full h-full">
      <img src={src} alt="XAI Heatmap" className="w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 50% at 42% 38%, rgba(239,68,68,0.72) 0%, rgba(251,146,60,0.55) 35%, rgba(234,179,8,0.35) 60%, rgba(16,185,129,0.15) 80%, transparent 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 20% 22% at 52% 45%, rgba(239,68,68,0.5) 0%, transparent 100%)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  )
}

export default function App() {
  const [state, setState] = useState<AppState>("idle")
  const [file, setFile] = useState<FileInfo | null>(null)
  const [dragging, setDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [navActive, setNavActive] = useState("Home")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    if (state === "results") {
      setNow(new Date())
      setTimeout(
        () =>
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100,
      )
    }
  }, [state])

  const validateAndSet = useCallback((f: File) => {
    if (!SUPPORTED_TYPES.includes(f.type)) {
      setErrorMsg("Please upload a valid JPG, JPEG, or PNG brain MRI image.")
      setState("error")
      return
    }
    if (f.size > MAX_SIZE) {
      setErrorMsg("File size exceeds 10 MB. Please upload a smaller image.")
      setState("error")
      return
    }
    const url = URL.createObjectURL(f)
    setFile({ name: f.name, size: f.size, url })
    setState("uploaded")
    setErrorMsg("")
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) validateAndSet(f)
    },
    [validateAndSet],
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) validateAndSet(f)
    e.target.value = ""
  }

  const removeFile = () => {
    if (file) URL.revokeObjectURL(file.url)
    setFile(null)
    setState("idle")
  }

  const analyze = () => {
    setState("analyzing")
    setTimeout(() => setState("results"), 2800)
  }

  const reset = () => {
    if (file) URL.revokeObjectURL(file.url)
    setFile(null)
    setState("idle")
  }

  const downloadReport = (type: "PDF" | "DOC") => {
    alert(
      `Generating ${type} report — in a production system, this would generate a full ${type} with MRI images, heatmap, and analysis data.`,
    )
  }

  const top = CLASSES[0]

  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrainIcon size={32} />
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-slate-900 leading-none">
                BrainScan AI
              </h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5 hidden sm:block">
                AI-Powered Brain Tumor Classification & Explainable Analysis
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {["Home", "About Model", "XAI"].map((item) => (
              <button
                key={item}
                onClick={() => setNavActive(item)}
                className={`px-3 py-1.5 text-[13px] rounded-md font-medium transition-colors ${
                  navActive === item
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Model Ready
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Upload Card */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 pt-7 pb-5 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">
                Upload Brain MRI
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Upload a brain MRI image to classify the scan using our AI
                model.
              </p>
            </div>

            <div className="p-8">
              {state === "error" ? (
                <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-10 text-center space-y-3">
                  <div className="text-3xl">⚠</div>
                  <p className="font-semibold text-red-700 text-sm">
                    Invalid Image
                  </p>
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                  <button
                    onClick={() => {
                      setState("idle")
                      setErrorMsg("")
                    }}
                    className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : state === "idle" ? (
                <div
                  className={`rounded-xl border-2 border-dashed transition-all duration-200 p-12 text-center cursor-pointer ${
                    dragging
                      ? "border-cyan-500 bg-cyan-50 scale-[1.01]"
                      : "border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center">
                      <UploadIcon />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-base">
                        Drag & Drop your MRI image here
                      </p>
                      <p className="text-slate-400 text-sm mt-1.5">or</p>
                    </div>
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                    >
                      Browse Image
                    </button>
                    <p className="text-xs text-slate-400 font-mono">
                      JPG, JPEG, PNG &nbsp;·&nbsp; Max 10 MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Preview */}
                  <div className="flex gap-5 items-start">
                    <div className="w-40 h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex-shrink-0">
                      <img
                        src={file!.url}
                        alt="MRI preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-snug break-all">
                            {file!.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {formatBytes(file!.size)}
                          </p>
                        </div>
                        <button
                          onClick={removeFile}
                          className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Image loaded
                      </div>
                    </div>
                  </div>

                  {state === "analyzing" ? (
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-8 text-center">
                      <Spinner />
                      <p className="font-semibold text-cyan-800 text-sm">
                        Analyzing MRI...
                      </p>
                      <p className="text-xs text-cyan-600 mt-1.5 max-w-sm mx-auto">
                        AI model is processing the image and generating an
                        explainability map.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={analyze}
                        className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                      >
                        Analyze MRI
                      </button>
                      <button
                        onClick={removeFile}
                        className="px-5 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium rounded-xl transition-colors border border-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Classification Info (idle state) */}
        {(state === "idle" || state === "error") && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Supported Classifications
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  icon: "🧠",
                  label: "Glioma Tumor",
                  desc: "Fast-growing, infiltrative",
                },
                {
                  icon: "🧠",
                  label: "Meningioma Tumor",
                  desc: "Meninges-originating",
                },
                {
                  icon: "🧠",
                  label: "Pituitary Tumor",
                  desc: "Pituitary gland region",
                },
                {
                  icon: "✓",
                  label: "No Tumor",
                  desc: "Healthy brain MRI",
                  healthy: true,
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className={`bg-white rounded-xl border p-4 space-y-2 ${
                    c.healthy ? "border-emerald-200" : "border-slate-200"
                  }`}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <p className="text-sm font-semibold text-slate-800">
                    {c.label}
                  </p>
                  <p className="text-xs text-slate-400">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {state === "results" && (
          <div ref={resultsRef} className="space-y-6">
            {/* Prediction Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  AI Prediction
                </h2>
              </div>
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Main prediction */}
                  <div className="space-y-3 flex-shrink-0">
                    <div className="inline-flex flex-col items-center px-6 py-4 rounded-2xl bg-red-50 border border-red-200">
                      <span className="text-2xl font-bold text-red-700 font-sans">
                        {top.label}
                      </span>
                      <span className="text-sm font-mono text-red-500 mt-1">
                        Predicted Class
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold font-mono text-slate-900">
                        {top.value}%
                      </span>
                      <p className="text-xs text-slate-400 font-mono">
                        Confidence
                      </p>
                    </div>
                  </div>

                  {/* Probability bars */}
                  <div className="flex-1 space-y-4 w-full">
                    {CLASSES.map((cls, i) => (
                      <div key={cls.label}>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span
                            className={`text-sm font-medium ${
                              i === 0 ? "text-slate-900" : "text-slate-500"
                            }`}
                          >
                            {cls.label}
                          </span>
                          <span
                            className="text-sm font-mono font-semibold"
                            style={{ color: cls.color }}
                          >
                            {cls.value}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${cls.value}%`,
                              backgroundColor: cls.color,
                              opacity: i === 0 ? 1 : 0.6,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* XAI Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  Explainable AI — Attention Heatmap
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  The heatmap highlights the regions of the MRI that contributed
                  most strongly to the AI prediction.
                </p>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      Original MRI
                    </p>
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                      <img
                        src={file!.url}
                        alt="Original MRI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      XAI Heatmap
                    </p>
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                      <HeatmapOverlay src={file!.url} />
                    </div>
                  </div>
                </div>

                {/* Heatmap legend */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    Low Importance
                  </span>
                  <div
                    className="flex-1 h-3 rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, #10b981, #eab308, #f97316, #ef4444)",
                    }}
                  />
                  <span className="text-xs text-slate-400 font-mono">
                    High Importance
                  </span>
                </div>

                {/* Info box */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center mt-0.5">
                    <span className="text-cyan-700 text-[11px] font-bold">
                      i
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-0.5">
                      How to interpret this
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      The highlighted regions represent areas that had greater
                      influence on the model's prediction. This visualization is
                      provided for model interpretability and should not be
                      considered a medical diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary + Export Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-900">
                    Analysis Summary
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      label: "Predicted Class",
                      value: top.label,
                      mono: false,
                      highlight: true,
                    },
                    {
                      label: "Confidence Score",
                      value: `${top.value}%`,
                      mono: true,
                    },
                    {
                      label: "Model Used",
                      value: "Brain MRI Classification CNN",
                      mono: false,
                    },
                    {
                      label: "Analysis Status",
                      value: "Complete",
                      mono: false,
                      badge: true,
                    },
                    {
                      label: "Date / Time",
                      value: now.toLocaleString(),
                      mono: true,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                        {row.label}
                      </span>
                      {row.badge ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ {row.value}
                        </span>
                      ) : (
                        <span
                          className={`text-xs text-right ${
                            row.highlight
                              ? "font-bold text-red-700"
                              : row.mono
                                ? "font-mono text-slate-600"
                                : "font-medium text-slate-700"
                          }`}
                        >
                          {row.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-900">
                    Export Analysis
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate a complete report including the MRI image, XAI
                    heatmap, classification probabilities, model info, and a
                    medical disclaimer.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => downloadReport("PDF")}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1z"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 1v5h5"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Download PDF Report
                    </button>
                    <button
                      onClick={() => downloadReport("DOC")}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1z"
                          stroke="#475569"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 1v5h5"
                          stroke="#475569"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Download DOC Report
                    </button>
                  </div>
                  <button
                    onClick={reset}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Analyze another MRI
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrainIcon size={20} />
            <span className="text-sm font-semibold text-slate-700">
              BrainScan AI
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">
              AI-assisted MRI classification
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center sm:text-right max-w-sm">
            For research and educational purposes only. This system does not
            replace professional medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  )
}
