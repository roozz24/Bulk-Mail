import { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';

function App() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const fileInputRef = useRef(null);
  const API = import.meta.env.VITE_API_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workBook = XLSX.read(data, { type: 'binary' });
      const sheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      // const rows = XLSX.utils.sheet_to_json(jsonData, { header: 1 });
      console.log(jsonData);

      setEmailList(jsonData);

      if (!file) return;
      setFile(file);

    }

    reader.readAsArrayBuffer(file);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setEmailList([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  function handleMessage(evt) {
    setMessage(evt.target.value);
  }

  const handleSubmit = () => {
    if (!file) {
      alert("Please attach an Excel file with email IDs.");
      return;
    }

    setIsSending(true);

    axios.post(`${API}/sendmail`, {
      msg: message,
      emails: emailList,
    }).then(function (data) {
      if (data.data === true) {
        alert("Emails sent successfully!!");
        setIsSending(false);
      } else {
        alert("Failed to send emails.");
        setIsSending(false);
      }
    })

    if (!message.trim()) {
      alert("Write your email content first.");
      return;
    }

    setIsSending(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce4ff] via-[#e6f0ff] to-[#fdf6e4] antialiased flex items-center justify-center px-4 py-8">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#ffc6ff] opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#bde0fe] opacity-50 blur-3xl" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#caffbf] opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="backdrop-blur-xl bg-white/70 border border-white/60 shadow-[0_18px_55px_rgba(15,23,42,0.15)] rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 md:gap-10">

          {/* Left side: info */}
          <section className="md:w-5/12 flex flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffc6ff]/80 to-[#bde0fe]/80 px-3 py-1 text-xs font-medium text-slate-800 mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Bulk Mail Studio • v1.0
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
                Send the bulk emails
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7b2cbf] to-[#ff6f91]">
                  with one click.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-md">
                Import email IDs from an Excel sheet, write your message once,
                and ship it to everyone. Clean UI, zero drama, maximum chaos in inboxes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="rounded-2xl bg-white/80 border border-white/80 shadow-sm p-3 sm:p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 mb-1">
                  Preview
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {file ? "Excel file attached" : "No file selected"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {file ? file.name : "Attach a .xlsx file"}
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#caffbf]/80 to-[#bde0fe]/80 border border-white/80 shadow-sm p-3 sm:p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-600 mb-1">
                  Status
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {isSending ? "Sending..." : "Ready to send"}
                </p>
                <p className="text-xs text-slate-600">
                  Draft your message & attach the list.
                </p>
              </div>
            </div>
          </section>

          {/* Right side: form */}
          <section className="md:w-7/12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffafcc]/70 text-[11px] font-semibold text-slate-900 shadow-sm">
                  1
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Compose your message
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7b2cbf]" />
                Plain text mailer
              </div>
            </div>

            {/* Message textarea */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-[0.14em]">
                Email content
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-40 sm:h-44 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 sm:px-5 sm:py-4 text-sm text-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] outline-none focus:ring-2 focus:ring-[#ffafcc] focus:border-transparent resize-none placeholder:text-slate-400"
                  placeholder="Write the message you want to send to everyone..."
                  value={message}
                  onChange={handleMessage}
                />
                <div className="pointer-events-none absolute right-4 bottom-3 text-[11px] text-slate-400">
                  {message.length}/1000
                </div>
              </div>
            </div>

            {/* Step 2 header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#bde0fe]/80 text-[11px] font-semibold text-slate-900 shadow-sm">
                  2
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Attach Excel file with email IDs
                </span>
              </div>
              <span className="hidden sm:inline text-[11px] text-slate-500">
                Supported: .xlsx
              </span>
            </div>

            {/* File uploader */}
            <div className="mb-6">
              <label className="sr-only">Excel file</label>
              <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 hover:border-[#ffafcc] transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {file ? "File selected:" : "Drop your Excel file here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {file
                      ? file.name
                      : "Or click the button to browse your files. Make sure it has a column with email IDs."}
                  </p>
                </div>

                <div className="flex flex-col items-stretch sm:items-end gap-2 min-w-[150px]">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#ffafcc] to-[#bde0fe] px-4 py-2 text-xs font-semibold text-slate-900 shadow-md hover:shadow-lg active:scale-[0.98] transition">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    Choose file
                  </label>

                  {file && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-[11px] text-slate-500 hover:text-slate-700 underline underline-offset-2 text-right"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-[#4a4a4a] mb-6 flex justify-center">
              Total Emails in the file: {function () {
                if (file === null) {
                  emailList.length = 0;
                } return emailList.length;
              }()}
            </p>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSending}
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold shadow-[0_14px_40px_rgba(244,114,182,0.6)] transition transform active:scale-[0.97] w-full sm:w-auto ${isSending
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#ff6f91] via-[#ffafcc] to-[#ffc6ff] text-slate-900 hover:shadow-[0_18px_50px_rgba(244,114,182,0.8)]"
                  }`}
              >
                {isSending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-slate-800 border-t-transparent animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>Send emails</span>
                    <span className="text-lg">🚀</span>
                  </span>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
