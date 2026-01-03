import React from 'react';
import { Eye, FileSearch, AlertCircle } from 'lucide-react';
import { getScoreClass } from '../utils/scoringEngine';

function ResultsTable({ results, isProcessing, onViewDetails }) {
    if (isProcessing) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon loading">
                    <FileSearch size={40} />
                </div>
                <div className="empty-state-title">Processing CVs...</div>
                <p>Analyzing documents and calculating scores</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <FileSearch size={40} />
                </div>
                <div className="empty-state-title">No Results Yet</div>
                <p>Upload CVs and click "Analyze CVs" to see rankings</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>Rank</th>
                        <th>Candidate</th>
                        <th style={{ width: '100px' }}>Overall</th>
                        <th style={{ width: '100px' }}>Semantic</th>
                        <th style={{ width: '100px' }}>Skills</th>
                        <th style={{ width: '100px' }}>Experience</th>
                        <th style={{ width: '100px' }}>Education</th>
                        <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, index) => (
                        <tr key={result.fileId}>
                            <td>
                                <span style={{
                                    fontWeight: 600,
                                    color: index < 3 ? 'var(--accent-primary)' : 'var(--text-muted)'
                                }}>
                                    #{index + 1}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500 }}>{result.candidateName}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {result.fileName}
                                    </span>
                                </div>
                            </td>
                            <td>
                                {result.error ? (
                                    <span className={`score-badge poor`}>
                                        <AlertCircle size={14} style={{ marginRight: '4px' }} />
                                        Error
                                    </span>
                                ) : (
                                    <span className={`score-badge ${result.classification}`}>
                                        {result.total}%
                                    </span>
                                )}
                            </td>
                            <td>
                                {result.breakdown && (
                                    <ScoreCell score={result.breakdown.semantic.score} />
                                )}
                            </td>
                            <td>
                                {result.breakdown && (
                                    <ScoreCell score={result.breakdown.skills.score} />
                                )}
                            </td>
                            <td>
                                {result.breakdown && (
                                    <ScoreCell score={result.breakdown.experience.score} />
                                )}
                            </td>
                            <td>
                                {result.breakdown && (
                                    <ScoreCell score={result.breakdown.education.score} />
                                )}
                            </td>
                            <td>
                                <button
                                    className="btn btn-secondary btn-icon"
                                    onClick={() => onViewDetails(result)}
                                    title="View Details"
                                    disabled={result.error}
                                >
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ScoreCell({ score }) {
    const scoreClass = getScoreClass(score);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="progress-bar" style={{ flex: 1, height: '6px' }}>
                <div
                    className={`progress-bar-fill ${scoreClass}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                minWidth: '32px',
                textAlign: 'right',
                color: 'var(--text-secondary)'
            }}>
                {score}%
            </span>
        </div>
    );
}

export default ResultsTable;
