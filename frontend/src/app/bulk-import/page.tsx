import { useState } from "react"
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
 
} from "lucide-react"

import { api } from "@/lib/api"

export default function BulkImportPage() {

  const [type, setType] = useState<"alumni" | "student">("alumni")
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

  async function handleSubmit() {

    if (!file) {
      setError("Please select a CSV file")
      return
    }

    try {

      setLoading(true)
      setError("")
      setResult(null)

      const formData = new FormData()
      formData.append("file", file)

      const res = await api.post(`/bulk-import/${type}`, formData)

      setResult(res.data)

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        "Import failed"
      )

    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* HEADER */}

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Bulk Import Profiles
        </h1>

        <p className="text-sm text-slate-500">
          Upload a CSV file to import multiple alumni or student profiles.
        </p>
      </div>


      {/* IMPORT PANEL */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">

        {/* TYPE SELECTOR */}

        <div className="space-y-2">

          <label className="text-sm font-medium text-slate-700">
            Import Type
          </label>

          <div className="flex gap-3">

            <button
              onClick={() => setType("alumni")}
              className={`px-4 py-2 text-sm rounded-md border transition ${
                type === "alumni"
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              Alumni
            </button>

            <button
              onClick={() => setType("student")}
              className={`px-4 py-2 text-sm rounded-md border transition ${
                type === "student"
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              Students
            </button>

          </div>

        </div>


        {/* FILE UPLOAD */}

        <div className="space-y-2">

          <label className="text-sm font-medium text-slate-700">
            CSV File
          </label>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center space-y-3">

            <FileSpreadsheet className="mx-auto text-blue-500" size={32} />

            <p className="text-sm text-slate-600">
              Drag and drop a CSV file here or select from your computer
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block mx-auto text-sm"
            />

            {file && (
              <p className="text-xs text-slate-500">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            )}

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}


        {/* ACTION BUTTON */}

        <div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            <UploadCloud size={16} />

            {loading ? "Importing..." : "Start Import"}

          </button>

        </div>

      </div>


      {/* IMPORT RESULTS */}

      {result && (

        <div className="space-y-6">

          {/* SUMMARY */}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

            <h2 className="font-semibold text-slate-900 mb-4">
              Import Summary
            </h2>

            <div className="grid grid-cols-3 gap-6 text-sm">

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-500">Total Rows</p>
                <p className="text-lg font-semibold">
                  {result.summary.totalRows}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700">Created</p>
                <p className="text-lg font-semibold text-green-700">
                  {result.summary.created}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700">Skipped</p>
                <p className="text-lg font-semibold text-red-700">
                  {result.summary.skipped}
                </p>
              </div>

            </div>

          </div>


          {/* SKIPPED ROWS */}

          {result.skipped?.length > 0 && (

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

              <div className="px-6 py-4 border-b font-medium text-slate-800">
                Skipped Rows
              </div>

              <table className="w-full text-sm">

                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-6 py-3">Row</th>
                    <th className="text-left px-6 py-3">Reason</th>
                  </tr>
                </thead>

                <tbody>

                  {result.skipped.map((item: any, i: number) => (

                    <tr key={i} className="border-t">

                      <td className="px-6 py-3 font-medium">
                        Row {item.row}
                      </td>

                      <td className="px-6 py-3 text-red-600">
                        {item.reason}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </div>
  )
}