/**
 * Unified Document Parser
 * Handles PDF, DOCX, and TXT files
 */

import { parsePDF } from './pdfParser';
import { parseDOCX } from './docxParser';

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

export function isSupported(filename) {
    const ext = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(ext);
}

export async function parseDocument(file) {
    const extension = getFileExtension(file.name);

    switch (extension) {
        case 'pdf':
            return await parsePDF(file);
        case 'docx':
            return await parseDOCX(file);
        case 'txt':
            return await parseTXT(file);
        default:
            throw new Error(`Unsupported file format: ${extension}`);
    }
}

async function parseTXT(file) {
    try {
        return await file.text();
    } catch (error) {
        console.error('TXT parsing error:', error);
        throw new Error(`Failed to parse TXT: ${error.message}`);
    }
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(filename) {
    const ext = getFileExtension(filename);
    switch (ext) {
        case 'pdf':
            return 'FileText';
        case 'docx':
            return 'FileType';
        case 'txt':
            return 'FileText';
        default:
            return 'File';
    }
}
