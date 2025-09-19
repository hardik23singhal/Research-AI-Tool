import type { UploadedFile } from '../types';

declare const mammoth: any;
declare const JSZip: any;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                 reject(new Error('Failed to read file as ArrayBuffer.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};

const extractTextFromPptx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slidePromises: Promise<string>[] = [];
    
    zip.folder("ppt/slides")?.forEach((relativePath, file) => {
        if (relativePath.startsWith("slide") && relativePath.endsWith(".xml")) {
            slidePromises.push(file.async("string"));
        }
    });

    const slideXmls = await Promise.all(slidePromises);
    let fullText = "";

    // Basic XML parsing to extract text from <a:t> tags
    const textRegex = /<a:t.*?>(.*?)<\/a:t>/g;
    for (const xml of slideXmls) {
        const slideText = Array.from(xml.matchAll(textRegex)).map(match => match[1]).join(" ");
        fullText += slideText + "\n\n";
    }

    return fullText.trim();
};

export const processFiles = async (files: FileList): Promise<UploadedFile[]> => {
    const processedFiles: UploadedFile[] = [];
    for (const file of Array.from(files)) {
        try {
            const docxType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            const pptxType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

            if (file.type === docxType) {
                const arrayBuffer = await fileToArrayBuffer(file);
                const result = await mammoth.extractRawText({ arrayBuffer });
                processedFiles.push({
                    name: file.name,
                    type: file.type,
                    base64: '', // Not needed
                    extractedText: result.value,
                });
            } else if (file.type === pptxType) {
                const arrayBuffer = await fileToArrayBuffer(file);
                const text = await extractTextFromPptx(arrayBuffer);
                processedFiles.push({
                    name: file.name,
                    type: file.type,
                    base64: '', // Not needed
                    extractedText: text,
                });
            } else { // Handle images, PDFs, and other files as before
                const base64 = await fileToBase64(file);
                processedFiles.push({
                    name: file.name,
                    type: file.type,
                    base64: base64,
                });
            }
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
        }
    }
    return processedFiles;
};