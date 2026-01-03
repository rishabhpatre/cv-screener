import React, { useState, useCallback } from 'react';
import {
    FileText,
    Upload,
    Users,
    Settings2,
    BarChart3,
    Sparkles
} from 'lucide-react';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import CVUploader from './components/CVUploader';
import ScoringConfig from './components/ScoringConfig';
import ResultsTable from './components/ResultsTable';
import CandidateScorecard from './components/CandidateScorecard';
import { parseDocument } from './utils/documentParser';
import { calculateScore, extractName, DEFAULT_WEIGHTS } from './utils/scoringEngine';
import { SAMPLE_JD, SAMPLE_CVS } from './utils/demoData';

function App() {
    // Job Description state
    const [jobDescription, setJobDescription] = useState('');

    // CV files and parsed data
    const [cvFiles, setCvFiles] = useState([]);
    const [results, setResults] = useState([]);

    // Scoring weights
    const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

    // UI state
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [activeTab, setActiveTab] = useState('setup');

    // Handle CV file uploads
    const handleFilesAdded = useCallback((newFiles) => {
        const filesWithId = newFiles.map(file => ({
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            status: 'pending',
            text: null,
            error: null,
        }));
        setCvFiles(prev => [...prev, ...filesWithId]);
    }, []);

    // Remove a CV file
    const handleFileRemove = useCallback((fileId) => {
        setCvFiles(prev => prev.filter(f => f.id !== fileId));
        setResults(prev => prev.filter(r => r.fileId !== fileId));
    }, []);

    // Process all CVs
    const handleProcess = useCallback(async () => {
        if (!jobDescription.trim() || cvFiles.length === 0) return;

        setIsProcessing(true);
        setActiveTab('results');

        const newResults = [];

        for (const cvFile of cvFiles) {
            try {
                // Parse document
                const text = cvFile.text || await parseDocument(cvFile.file);

                // Update file status
                setCvFiles(prev => prev.map(f =>
                    f.id === cvFile.id ? { ...f, status: 'processed', text } : f
                ));

                // Calculate score
                const scoreResult = calculateScore(text, jobDescription, {}, weights);
                const candidateName = extractName(text);

                newResults.push({
                    fileId: cvFile.id,
                    fileName: cvFile.file.name,
                    candidateName,
                    text,
                    ...scoreResult,
                });
            } catch (error) {
                console.error(`Error processing ${cvFile.file.name}:`, error);
                setCvFiles(prev => prev.map(f =>
                    f.id === cvFile.id ? { ...f, status: 'error', error: error.message } : f
                ));

                newResults.push({
                    fileId: cvFile.id,
                    fileName: cvFile.file.name,
                    candidateName: 'Error',
                    total: 0,
                    classification: 'poor',
                    error: error.message,
                    breakdown: null,
                });
            }
        }

        // Sort by score descending
        newResults.sort((a, b) => b.total - a.total);
        setResults(newResults);
        setIsProcessing(false);
    }, [jobDescription, cvFiles, weights]);

    // Reprocess with new weights
    const handleWeightsChange = useCallback((newWeights) => {
        setWeights(newWeights);

        // Recalculate scores if we have results
        if (results.length > 0) {
            const updatedResults = results.map(result => {
                if (!result.text || result.error) return result;
                const scoreResult = calculateScore(result.text, jobDescription, {}, newWeights);
                return { ...result, ...scoreResult };
            });
            updatedResults.sort((a, b) => b.total - a.total);
            setResults(updatedResults);
        }
    }, [results, jobDescription]);

    // Load Demo Data
    const handleLoadDemoData = useCallback(() => {
        setJobDescription(SAMPLE_JD);

        const demoFiles = SAMPLE_CVS.map(cv => ({
            file: { name: cv.name, size: cv.content.length },
            id: `demo-${cv.name}-${Date.now()}`,
            status: 'pending',
            text: cv.content, // Pre-filled text
            error: null,
        }));

        setCvFiles(prev => [...prev, ...demoFiles]);
    }, []);

    // Stats
    const stats = {
        totalCandidates: results.length,
        avgScore: results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.total, 0) / results.length)
            : 0,
        topScore: results.length > 0 ? results[0]?.total || 0 : 0,
    };

    return (
        <div className="app-container">
            <div style={{ width: '100%' }}>
                {/* Header */}
                <header className="app-header">
                    <div className="app-logo">
                        <div className="app-logo-icon">
                            <Sparkles size={24} />
                        </div>
                        <span className="app-logo-text">CV Screener</span>
                    </div>

                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'setup' ? 'active' : ''}`}
                            onClick={() => setActiveTab('setup')}
                        >
                            <Settings2 size={16} style={{ marginRight: '6px' }} />
                            Setup
                        </button>
                        <button
                            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                            onClick={() => setActiveTab('results')}
                        >
                            <BarChart3 size={16} style={{ marginRight: '6px' }} />
                            Results {results.length > 0 && `(${results.length})`}
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="main-content">
                    {activeTab === 'setup' && (
                        <>
                            <div className="dashboard-grid">
                                {/* Job Description Panel */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <FileText size={20} />
                                            Job Description
                                        </h3>
                                    </div>
                                    <JobDescriptionPanel
                                        value={jobDescription}
                                        onChange={setJobDescription}
                                    />
                                </div>

                                {/* CV Uploader */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <Upload size={20} />
                                            Upload CVs
                                        </h3>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {cvFiles.length} file{cvFiles.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <CVUploader
                                        files={cvFiles}
                                        onFilesAdded={handleFilesAdded}
                                        onFileRemove={handleFileRemove}
                                    />
                                </div>
                            </div>

                            {/* Scoring Configuration */}
                            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <Settings2 size={20} />
                                        Scoring Parameters
                                    </h3>
                                </div>
                                <ScoringConfig
                                    weights={weights}
                                    onChange={handleWeightsChange}
                                />
                            </div>

                            {/* Process Button */}
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleProcess}
                                    disabled={!jobDescription.trim() || cvFiles.length === 0 || isProcessing}
                                    style={{
                                        padding: '1rem 3rem',
                                        fontSize: '1rem',
                                        opacity: (!jobDescription.trim() || cvFiles.length === 0) ? 0.5 : 1,
                                    }}
                                >
                                    {isProcessing ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Analyze CVs
                                        </>
                                    )}
                                </button>
                                {(!jobDescription.trim() || cvFiles.length === 0) && (
                                    <div style={{ marginTop: 'var(--space-md)' }}>
                                        <p style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '0.875rem',
                                            marginBottom: 'var(--space-sm)'
                                        }}>
                                            Add a job description and upload CVs to begin
                                        </p>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleLoadDemoData}
                                            style={{ fontSize: '0.875rem' }}
                                        >
                                            Load Demo Data
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'results' && (
                        <>
                            {/* Stats Row */}
                            {results.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 'var(--space-lg)',
                                    marginBottom: 'var(--space-xl)'
                                }}>
                                    <div className="stat-card">
                                        <div className="stat-value">{stats.totalCandidates}</div>
                                        <div className="stat-label">Total Candidates</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{stats.avgScore}%</div>
                                        <div className="stat-label">Average Score</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{stats.topScore}%</div>
                                        <div className="stat-label">Top Score</div>
                                    </div>
                                </div>
                            )}

                            {/* Results Table */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <Users size={20} />
                                        Candidate Rankings
                                    </h3>
                                </div>
                                <ResultsTable
                                    results={results}
                                    isProcessing={isProcessing}
                                    onViewDetails={setSelectedCandidate}
                                />
                            </div>
                        </>
                    )}
                </main>

                {/* Candidate Scorecard Modal */}
                {selectedCandidate && (
                    <CandidateScorecard
                        candidate={selectedCandidate}
                        onClose={() => setSelectedCandidate(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
