# certificate_filler

Blazor Progressive Web App (PWA) for populating PDF certificates with names and other data. It can be accessed via Github Pages. To use, provide a PDF form and a CSV file or spreadsheet whose columns match the field names. The first row is taken to be a header. One filled PDF will be generated per (non-header) row in the input file. Leverages [sheetjs](https://github.com/SheetJS/sheetjs) for parsing CSV and Excel files, [pdf-lib](https://github.com/Hopding/pdf-lib) for loading PDFs, filling forms, and flattening the results, and [JSZip](https://github.com/Stuk/jszip) for bundling the resulting PDFs into a zip archive.

[Try App](https://mou141.github.io/certificate_filler/)
