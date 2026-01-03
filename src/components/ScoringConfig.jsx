import React from 'react';
import { Brain, Wrench, Briefcase, GraduationCap } from 'lucide-react';

const WEIGHT_CONFIG = [
    {
        key: 'semantic',
        label: 'Semantic Match',
        icon: Brain,
        description: 'How well the CV content matches the JD requirements'
    },
    {
        key: 'skills',
        label: 'Skills Match',
        icon: Wrench,
        description: 'Required technical and soft skills'
    },
    {
        key: 'experience',
        label: 'Work Experience',
        icon: Briefcase,
        description: 'Years of relevant experience'
    },
    {
        key: 'education',
        label: 'Education',
        icon: GraduationCap,
        description: 'Educational qualifications'
    },
];

function ScoringConfig({ weights, onChange }) {
    const handleChange = (key, value) => {
        onChange({
            ...weights,
            [key]: parseInt(value, 10),
        });
    };

    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

    return (
        <div>
            <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-lg)'
            }}>
                Adjust the weight of each scoring parameter. Weights are automatically normalized.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-lg)'
            }}>
                {WEIGHT_CONFIG.map(({ key, label, icon: Icon, description }) => (
                    <div
                        key={key}
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-sm)'
                        }}>
                            <Icon size={18} style={{ color: 'var(--accent-primary)' }} />
                            <span style={{ fontWeight: 500 }}>{label}</span>
                            <span style={{
                                marginLeft: 'auto',
                                fontWeight: 600,
                                color: 'var(--accent-primary)'
                            }}>
                                {Math.round((weights[key] / total) * 100)}%
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginBottom: 'var(--space-sm)'
                        }}>
                            {description}
                        </p>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={weights[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            style={{
                                width: '100%',
                                height: '6px',
                                appearance: 'none',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-full)',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-md)',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Total weight points: {total}
                </span>
                <button
                    className="btn btn-secondary"
                    onClick={() => onChange({ semantic: 40, skills: 25, experience: 20, education: 15 })}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                    Reset to Default
                </button>
            </div>
        </div>
    );
}

export default ScoringConfig;
