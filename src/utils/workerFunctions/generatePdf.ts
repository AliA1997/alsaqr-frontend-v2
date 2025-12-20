import PDFWorker  from '@webWorkers/pdfWorker?worker';

// Define the type for our allowed PDF categories
type PDFType = 'post' | 'comment';

export const generateAndDownloadPdf = (
  type: PDFType,
  props: any, // This will be passed to either PostPDF or CommentPDF
  fileName: string
) => {
  const worker = new PDFWorker();

  // Send the specific type and props to the worker
  worker.postMessage({ type, props });

  worker.onmessage = (e) => {
    const { status, blob, error } = e.data;
    if (status === 'success') {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      console.error(`[PDF Worker Error]: ${error}`);
    }
    worker.terminate();
  };
};