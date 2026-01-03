import React from 'react';
import { extractSkills } from '../utils/skillsExtractor';
import { extractExperience, extractEducation } from '../utils/scoringEngine';

function JobDescriptionPanel({ value, onChange }) {
    // Parse JD to show extracted requirements
    const skills = value ? extractSkills(value) : [];
    const experience = value ? extractExperience(value) : 0;
    const education = value ? extractEducation(value) : { level: 0, degrees: [] };

    return (
        <div>
            <div className="form-group">
                <label className="label">Paste your job description below</label>
                <textarea
                    className="textarea"
                    placeholder="Enter the job description here. Include required skills, experience, education requirements, and key responsibilities..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ minHeight: '200px' }}
                />
            </div>

            {value && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <h4 style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        marginBottom: 'var(--space-md)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Detected Requirements
                    </h4>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: 'var(--space-xs)'
                            }}>Skills ({skills.length})</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                {skills.slice(0, 15).map((skill, i) => (
                                    <span key={i} className="tag">{skill}</span>
                                ))}
                                {skills.length > 15 && (
                                    <span className="tag" style={{ background: 'var(--accent-glow)' }}>
                                        +{skills.length - 15} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {experience > 0 && (
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: 'var(--space-xs)'
                            }}>Experience Required</span>
                            <span className="tag">{experience}+ years</span>
                        </div>
                    )}

                    {/* Education */}
                    {education.degrees.length > 0 && (
                        <div>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: 'var(--space-xs)'
                            }}>Education</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                {education.degrees.map((degree, i) => (
                                    <span key={i} className="tag">{degree}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default JobDescriptionPanel;
