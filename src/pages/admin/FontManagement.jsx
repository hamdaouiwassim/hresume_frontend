import { useState, useEffect } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  Upload,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Type,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminFonts,
  uploadAdminFont,
  toggleAdminFont,
  deleteAdminFont,
} from "../../services/adminService";

export default function FontManagement() {
  const [fonts, setFonts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [files, setFiles] = useState({
    regular: null,
    bold: null,
    italic: null,
    bold_italic: null,
  });

  const fetchFonts = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminFonts();
      if (response.data.status) {
        setFonts(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load fonts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const handleFileChange = (variant, e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["ttf", "otf"].includes(ext)) {
        toast.error("Only .ttf and .otf files are accepted");
        e.target.value = "";
        return;
      }
      setFiles((prev) => ({ ...prev, [variant]: file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) {
      toast.error("Font family name is required");
      return;
    }
    if (!files.regular) {
      toast.error("Regular font file is required");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("family_name", familyName.trim());
      formData.append("regular", files.regular);
      if (files.bold) formData.append("bold", files.bold);
      if (files.italic) formData.append("italic", files.italic);
      if (files.bold_italic) formData.append("bold_italic", files.bold_italic);

      const response = await uploadAdminFont(formData);
      if (response.data.status) {
        toast.success("Font uploaded successfully!");
        setFamilyName("");
        setFiles({ regular: null, bold: null, italic: null, bold_italic: null });
        setShowUploadForm(false);
        fetchFonts();
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.family_name?.[0] ||
        "Failed to upload font";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggle = async (font) => {
    try {
      const response = await toggleAdminFont(font.id);
      if (response.data.status) {
        toast.success(response.data.message);
        setFonts((prev) =>
          prev.map((f) =>
            f.id === font.id ? { ...f, is_active: !f.is_active } : f
          )
        );
      }
    } catch (error) {
      toast.error("Failed to toggle font");
    }
  };

  const handleDelete = async (font) => {
    if (!confirm(`Delete font "${font.family_name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const response = await deleteAdminFont(font.id);
      if (response.data.status) {
        toast.success("Font deleted");
        setFonts((prev) => prev.filter((f) => f.id !== font.id));
      }
    } catch (error) {
      toast.error("Failed to delete font");
    }
  };

  const variantLabel = (variant) => {
    const labels = {
      regular_path: "Regular",
      bold_path: "Bold",
      italic_path: "Italic",
      bold_italic_path: "Bold Italic",
    };
    return labels[variant] || variant;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Type className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  PDF Font Management
                </h1>
                <p className="text-sm text-gray-500">
                  Upload custom fonts for PDF resume generation
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Upload className="h-4 w-4" />
              {showUploadForm ? "Cancel" : "Upload Font"}
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Upload New Font
              </h2>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Font file requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>Accepted formats: <strong>.ttf</strong> and <strong>.otf</strong></li>
                      <li><strong>Regular</strong> variant is required</li>
                      <li>Bold, Italic, and Bold Italic are optional but recommended for proper rendering</li>
                      <li>You can download free fonts from <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Fonts</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                {/* Font Family Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Font Family Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. Roboto, Open Sans, Poppins"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* File Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "regular", label: "Regular", required: true },
                    { key: "bold", label: "Bold", required: false },
                    { key: "italic", label: "Italic", required: false },
                    { key: "bold_italic", label: "Bold Italic", required: false },
                  ].map((variant) => (
                    <div key={variant.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {variant.label}{" "}
                        {variant.required ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="text-gray-400">(optional)</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".ttf,.otf"
                          onChange={(e) => handleFileChange(variant.key, e)}
                          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer border border-gray-300 rounded-xl py-1.5 px-2"
                          required={variant.required}
                        />
                        {files[variant.key] && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                      isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Font
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Font List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Uploaded Fonts ({fonts.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Loading fonts...</span>
              </div>
            ) : fonts.length === 0 ? (
              <div className="text-center py-16">
                <Type className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No custom fonts uploaded yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Click "Upload Font" to add TTF/OTF fonts for PDF generation
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${font.is_active ? "bg-purple-100" : "bg-gray-100"}`}>
                        <Type className={`h-5 w-5 ${font.is_active ? "text-purple-600" : "text-gray-400"}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${font.is_active ? "text-gray-900" : "text-gray-400"}`}>
                          {font.family_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {["regular_path", "bold_path", "italic_path", "bold_italic_path"].map(
                            (variant) => (
                              <span
                                key={variant}
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                  font[variant]
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {font[variant] ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                {variantLabel(variant)}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(font)}
                        className={`p-2 rounded-lg transition-colors ${
                          font.is_active
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                        title={font.is_active ? "Deactivate" : "Activate"}
                      >
                        {font.is_active ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(font)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete font"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Built-in Fonts Info */}
          <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Built-in Fonts (always available)</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Helvetica (Sans-Serif)",
                "Times (Serif)",
                "Courier (Monospace)",
                "DejaVu Sans",
                "DejaVu Serif",
                "DejaVu Sans Mono",
              ].map((name) => (
                <span
                  key={name}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
