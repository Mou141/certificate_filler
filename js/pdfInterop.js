// pdfInterop.js
// This file contains JavaScript interop functions for PDF operations in the Certificate Filler application.


import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';
import JSZip from 'https://cdn.skypack.dev/jszip@3.10.1';


const pdfStore = new Map();
const urlStore = new Map();
const blobStore = new Map();

const zipUrlStore = new Set();

function generateId() {
    return crypto.randomUUID();
}

function hasForm(pdfDoc) {
    const form = pdfDoc.getForm();
    return form && form.getFields().length > 0;
}

export async function loadPdf(fileBytes) {
    const pdfDoc = await PDFDocument.load(fileBytes);

    if (!hasForm(pdfDoc)) {
        throw new Error("No form fields found in the PDF document.");
    }

    const id = generateId();

    pdfStore.set(id, pdfDoc);

    return id;
}

export async function getPdfBlobUrl(id) {
    if (urlStore.has(id)) {
        return urlStore.get(id);
    }

    if (!pdfStore.has(id)) {
        throw new Error(`PDF with id ${id} does not exist.`);
    }

    const pdfDoc = pdfStore.get(id);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    blobStore.set(id, blob);
    urlStore.set(id, url);

    return url;
}

export function getPdfBlob(id) {
    if (blobStore.has(id)) {
        return blobStore.get(id);
    }

    if (!pdfStore.has(id)) {
        throw new Error(`PDF with id ${id} does not exist.`);
    }

    getPdfBlobUrl(id); // Ensure URL is created (and thus blob is stored)

    return blobStore.get(id);
}

export async function getPdfBytes(id) {
    if (!pdfStore.has(id)) {
        throw new Error(`PDF with id ${id} does not exist.`);
    }
    
    const pdfDoc = pdfStore.get(id);
    const pdfBytes = await pdfDoc.save();

    return Array.from(pdfBytes); // Convert Uint8Array to Array for compatibility
}

export function deletePdf(id) {
    if (urlStore.has(id)) {
        URL.revokeObjectURL(urlStore.get(id));
        urlStore.delete(id);
    }

    if (blobStore.has(id)) {
        blobStore.delete(id);
    }

    if (pdfStore.has(id)) {
        pdfStore.delete(id);
    } else {
        throw new Error(`PDF with id ${id} does not exist.`);
    }
}

export function clearAllPdfs() {
    urlStore.forEach((url) => {
        URL.revokeObjectURL(url);
    });

    zipUrlStore.forEach((url) => {
        URL.revokeObjectURL(url);
    });

    urlStore.clear();
    pdfStore.clear();
    blobStore.clear();

    zipUrlStore.clear();
}

export function setupUnloadListener() {
    window.addEventListener('beforeunload', () => {
        clearAllPdfs();
    });
}

export async function fillAndFlattenPdf(originalId, formData, strict = false) {
    if (!pdfStore.has(originalId)) {
        throw new Error(`PDF with id ${originalId} does not exist.`);
    }

    const originalPdf = pdfStore.get(originalId);

    if (!hasForm(originalPdf)) {
        throw new Error("No form fields found in the original PDF document.");
    }

    const originalBytes = await originalPdf.save();

    const newPdf = await PDFDocument.load(originalBytes);
    const form = newPdf.getForm();

    for (const [key, value] of Object.entries(formData)) {
        try {
            const field = form.getTextField(key);

            field.setText(String(value));

        } catch (error) {
            if (strict) {
                throw new Error(`Could not set field '${key}': ${error.message}`);
            }

            console.warn(`Could not set field '${key}': ${error.message}. Ignoring due to 'strict' mode being off.`);
        }
    }

    form.flatten();

    const id = generateId();
    pdfStore.set(id, newPdf);

    return id;
}

export async function createZipFromPdfs(pdfDict) {
    const zip = new JSZip();

    for (const [name, id] of Object.entries(pdfDict)) {
        const blob = await getPdfBlob(id);

        zip.file(name, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);

    zipUrlStore.add(zipUrl);

    return zipUrl;
}

export async function mergePdfs(pdfIds) {
    if (pdfIds.length === 0) {
        throw new Error("No PDF IDs provided for merging.");
    }

    const mergedPdf = await PDFDocument.create();

    for (const id of pdfIds) {
        if (!pdfStore.has(id)) {
            throw new Error(`PDF with id ${id} does not exist.`);
        }

        const pdfDoc = pdfStore.get(id);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

        copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
        });
    }

    const id = generateId();
    pdfStore.set(id, mergedPdf);

    return id;
}

export function deleteZipUrl(zipUrl) {
    if (zipUrlStore.has(zipUrl)) {
        URL.revokeObjectURL(zipUrl);
        zipUrlStore.delete(zipUrl);
    }
}