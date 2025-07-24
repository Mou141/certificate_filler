// sheetjsInterop.js
// Wrapper module for SheetJS for use with Blazor

import * as XLSX from 'https://unpkg.com/xlsx/xlsx.mjs';

export async function parseFile(fileBytes) {
    try {
        const data = new Uint8Array(fileBytes);
        const workbook = XLSX.read(data, { type: 'array' });

        if (workbook.SheetNames.length === 0) {
            throw new Error('No sheets found in the workbook.');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        return XLSX.utils.sheet_to_json(worksheet, {defval: "", raw: false, dateNF: "dd/MM/yyyy" });
    } catch (error) {
        throw error;
    }
}