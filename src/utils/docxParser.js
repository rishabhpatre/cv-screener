/**
 * DOCX Parser using Mammoth
 */

import mammoth from 'mammoth';

export async function parseDOCX(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value.trim();
    } catch (error) {
        console.error('DOCX parsing error:', error);
        throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
}
