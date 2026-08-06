import { X, Download } from "lucide-react";
import { PDFDownloadLink, PDFViewer, type DocumentProps } from "@react-pdf/renderer";
import { useEffect, useState, type ReactElement } from "react";

interface PDFPreviewModalProps {
  document: ReactElement<DocumentProps>;
  onClose: () => void;
  title?: string;
  fileName?: string;
}

export function PDFPreviewModal({
  document,
  onClose,
  title = "PDF Preview",
  fileName = "document.pdf",
}: PDFPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = "auto";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-evolw-slate rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-evolw-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-white/5">
          <h2 className="text-lg font-bold text-evolw-black dark:text-white truncate">{title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            <PDFDownloadLink document={document} fileName={fileName}>
              {({ loading }) => (
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-evolw-accent text-white hover:bg-evolw-accent/90 cursor-pointer">
                  <Download className="w-4 h-4" />
                  {loading ? "Preparing…" : "Download PDF"}
                </span>
              )}
            </PDFDownloadLink>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-evolw-gray-500 hover:text-evolw-black dark:text-evolw-gray-400 dark:hover:text-white hover:bg-evolw-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-evolw-gray-100 dark:bg-evolw-black">
          <PDFViewer width="100%" height="100%" className="border-none" showToolbar={false}>
            {document}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
