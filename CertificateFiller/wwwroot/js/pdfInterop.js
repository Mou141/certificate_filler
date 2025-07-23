// pdfInterop.js
// This file contains JavaScript interop functions for PDF operations in the Certificate Filler application.


import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

const pdfStore = new Map();

function generateId() {
    return crypto.randomUUID();
}

export async function loadPdf(fileBytes) {
    const pdfDoc = await PDFDocument.load(fileBytes);

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (!fields || fields.length === 0) {
        throw new Error("No form fields found in the PDF document.");
    }

    const id = generateId();

    pdfStore.set(id, pdfDoc);

    return id;
}

export function deletePdf(id) {
    if (pdfStore.has(id)) {
        pdfStore.delete(id);
    } else {
        throw new Error(`PDF with id ${id} does not exist.`);
    }
}