// utils.js
// Utility functions for the Certificate Filler application

export function clearInputFileElem(inputFile) {
    if (inputFile) {
        inputFile.value = ''; // Clear the file input element
    }
}