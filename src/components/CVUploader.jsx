import React, { useCallback, useState } from 'react';
import { Upload, FileText, FileType, X, AlertCircle, CheckCircle } from 'lucide-react';
import { isSupported, formatFileSize, getFileExtension } from '../utils/documentParser';

function CVUploader({ files, onFilesAdded, onFileRemove }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file => isSupported(file.name));

        if (validFiles.length > 0) {
            onFilesAdded(validFiles);
        }
    }, [onFilesAdded]);

    const handleFileInput = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => isSupported(file.name));

        if (validFiles.length > 0) {
            onFilesAdded(validFiles);
        }

        // Reset input
        e.target.value = '';
    }, [onFilesAdded]);

    const getFileIcon = (filename) => {
        const ext = getFileExtension(filename);
        switch (ext) {
            case 'pdf':
                return <FileText size={20} />;
            case 'docx':
                return <FileType size={20} />;
            default:
                return <FileText size={20} />;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processed':
                return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
            case 'error':
                return <AlertCircle size={16} style={{ color: 'var(--danger)' }} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Drop Zone */}
            <div
                className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
            >
                <div className="upload-zone-icon">
                    <Upload size={32} />
                </div>
                <div className="upload-zone-title">
                    Drop CVs here or click to browse
                </div>
                <div className="upload-zone-subtitle">
                    Supports PDF, DOCX, and TXT files
                </div>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <ul className="file-list">
                    {files.map((fileItem) => (
                        <li key={fileItem.id} className="file-item">
                            <div className="file-icon">
                                {getFileIcon(fileItem.file.name)}
                            </div>
                            <div className="file-info">
                                <div className="file-name">{fileItem.file.name}</div>
                                <div className="file-size">
                                    {formatFileSize(fileItem.file.size)}
                                    {fileItem.error && (
                                        <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>
                                            {fileItem.error}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {getStatusIcon(fileItem.status)}
                            <button
                                className="file-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileRemove(fileItem.id);
                                }}
                            >
                                <X size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CVUploader;
