import React from 'react';
import {
    X,
    Brain,
    Wrench,
    Briefcase,
    GraduationCap,
    CheckCircle,
    XCircle,
    Download
} from 'lucide-react';
import { getScoreClass } from '../utils/scoringEngine';

function CandidateScorecard({ candidate, onClose }) {
    const { breakdown, candidateName, fileName, total, classification } = candidate;

    const educationLevelLabels = {
        6: 'PhD/Doctorate',
        5: 'Masters',
        4: 'Bachelors',
        3: 'Diploma',
        2: 'Associate',
        1: 'High School',
        0: 'Not specified'
    };

    const handleExport = () => {
        const data = {
            candidate: candidateName,
            file: fileName,
            overallScore: total,
            breakdown: {
                semantic: breakdown.semantic.score,
                skills: breakdown.skills.score,
                experience: breakdown.experience.score,
                education: breakdown.education.score,
            },
            matchedSkills: breakdown.skills.matched,
            unmatchedSkills: breakdown.skills.unmatched,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${candidateName.replace(/\s+/g, '_')}_scorecard.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 style={{ marginBottom: '4px' }}>{candidateName}</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {fileName}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button className="btn btn-secondary btn-icon" onClick={handleExport} title="Export">
                            <Download size={18} />
                        </button>
                        <button className="modal-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Overall Score */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 'var(--space-xl)',
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <div style={{
                            fontSize: '4rem',
                            fontWeight: 700,
                            background: 'var(--accent-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: 1
                        }}>
                            {total}%
                        </div>
                        <div style={{
                            fontSize: '1rem',
                            color: 'var(--text-muted)',
                            marginTop: 'var(--space-xs)'
                        }}>
                            Overall Match Score
                        </div>
                        <span className={`score-badge ${classification}`} style={{ marginTop: 'var(--space-sm)' }}>
                            {classification.charAt(0).toUpperCase() + classification.slice(1)} Match
                        </span>
                    </div>

                    {/* Score Breakdown */}
                    <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Score Breakdown
                    </h4>
                    <div className="score-breakdown" style={{ marginBottom: 'var(--space-xl)' }}>
                        <ScoreBreakdownItem
                            icon={Brain}
                            label="Semantic Match"
                            score={breakdown.semantic.score}
                            weight={breakdown.semantic.weight}
                        />
                        <ScoreBreakdownItem
                            icon={Wrench}
                            label="Skills Match"
                            score={breakdown.skills.score}
                            weight={breakdown.skills.weight}
                        />
                        <ScoreBreakdownItem
                            icon={Briefcase}
                            label="Experience"
                            score={breakdown.experience.score}
                            weight={breakdown.experience.weight}
                            detail={`${breakdown.experience.cvYears} years (${breakdown.experience.requiredYears} required)`}
                        />
                        <ScoreBreakdownItem
                            icon={GraduationCap}
                            label="Education"
                            score={breakdown.education.score}
                            weight={breakdown.education.weight}
                            detail={educationLevelLabels[breakdown.education.cvLevel]}
                        />
                    </div>

                    {/* Skills Analysis */}
                    <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Skills Analysis
                    </h4>

                    {/* Matched Skills */}
                    {breakdown.skills.matched.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                <CheckCircle size={14} />
                                Matched Skills ({breakdown.skills.matched.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                {breakdown.skills.matched.map((skill, i) => (
                                    <span key={i} className="tag matched">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unmatched Skills */}
                    {breakdown.skills.unmatched.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--danger)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                <XCircle size={14} />
                                Missing Skills ({breakdown.skills.unmatched.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                {breakdown.skills.unmatched.map((skill, i) => (
                                    <span key={i} className="tag unmatched">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Extracted Skills from CV */}
                    {breakdown.skills.extracted && breakdown.skills.extracted.length > 0 && (
                        <div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                All Skills Found in CV ({breakdown.skills.extracted.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                {breakdown.skills.extracted.slice(0, 20).map((skill, i) => (
                                    <span key={i} className="tag">{skill}</span>
                                ))}
                                {breakdown.skills.extracted.length > 20 && (
                                    <span className="tag">+{breakdown.skills.extracted.length - 20} more</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScoreBreakdownItem({ icon: Icon, label, score, weight, detail }) {
    const scoreClass = getScoreClass(score);

    return (
        <div className="score-breakdown-item">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-xs)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                    <Icon size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span className="score-breakdown-label" style={{ margin: 0 }}>{label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {weight}% weight
                </span>
            </div>
            <div className="score-breakdown-value" style={{ color: `var(--${scoreClass === 'excellent' ? 'success' : scoreClass === 'good' ? 'info' : scoreClass === 'average' ? 'warning' : 'danger'})` }}>
                {score}%
            </div>
            {detail && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {detail}
                </div>
            )}
            <div className="progress-bar" style={{ marginTop: 'var(--space-sm)' }}>
                <div className={`progress-bar-fill ${scoreClass}`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

export default CandidateScorecard;
