import React from 'react';
import type { AgentType } from '../types/agent';

interface RobotAnimationProps {
    agentType: AgentType;
    status: 'idle' | 'working' | 'info' | 'completed' | 'error' | 'timeout';
    size?: number;
}

// Color themes for each agent type
const agentThemes: Record<AgentType, { primary: string; secondary: string; glow: string }> = {
    orchestrator: {
        primary: '#00AA4D',
        secondary: '#00d65e',
        glow: 'rgba(0, 170, 77, 0.4)',
    },
    legislative: {
        primary: '#E3AD6D',
        secondary: '#F5C88A',
        glow: 'rgba(227, 173, 109, 0.4)',
    },
    political: {
        primary: '#006636',
        secondary: '#00AA4D',
        glow: 'rgba(0, 102, 54, 0.4)',
    },
    fiscal: {
        primary: '#F59E0B',
        secondary: '#FBBF24',
        glow: 'rgba(245, 158, 11, 0.4)',
    },
    consolidator: {
        primary: '#7C3AED',
        secondary: '#A78BFA',
        glow: 'rgba(124, 58, 237, 0.4)',
    },
};

// Agent-specific icons/decorations
const getAgentDecoration = (agentType: AgentType): React.ReactElement => {
    switch (agentType) {
        case 'orchestrator':
            // Antenna with waves
            return (
                <g className="agent-decoration">
                    <line x1="32" y1="8" x2="32" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="32" cy="2" r="2" fill="currentColor" className="antenna-tip" />
                    <path d="M26 6 Q32 0 38 6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" className="wave wave-1" />
                    <path d="M24 8 Q32 -2 40 8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="wave wave-2" />
                </g>
            );
        case 'legislative':
            // Balance scales
            return (
                <g className="agent-decoration" transform="translate(24, 4)">
                    <line x1="8" y1="0" x2="8" y2="4" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 4 L0 8 L4 8 Z" fill="currentColor" className="scale-left" />
                    <path d="M14 4 L12 8 L16 8 Z" fill="currentColor" className="scale-right" />
                </g>
            );
        case 'political':
            // Congress building columns
            return (
                <g className="agent-decoration" transform="translate(22, 2)">
                    <rect x="0" y="6" width="20" height="2" fill="currentColor" opacity="0.8" />
                    <rect x="2" y="3" width="2" height="3" fill="currentColor" />
                    <rect x="6" y="3" width="2" height="3" fill="currentColor" />
                    <rect x="12" y="3" width="2" height="3" fill="currentColor" />
                    <rect x="16" y="3" width="2" height="3" fill="currentColor" />
                    <polygon points="10,0 0,3 20,3" fill="currentColor" opacity="0.9" />
                </g>
            );
        case 'fiscal':
            // Magnifying glass
            return (
                <g className="agent-decoration" transform="translate(26, 2)">
                    <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="9" y1="9" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'consolidator':
            // Gears
            return (
                <g className="agent-decoration consolidator-gears" transform="translate(24, 2)">
                    <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="gear gear-1" />
                    <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.5" />
                    <circle cx="14" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="gear gear-2" />
                    <circle cx="14" cy="8" r="1.5" fill="currentColor" opacity="0.5" />
                </g>
            );
        default:
            return <></>;
    }
};

export const RobotAnimation: React.FC<RobotAnimationProps> = ({
    agentType,
    status,
    size = 64,
}) => {
    const theme = agentThemes[agentType];
    const isWorking = status === 'working' || status === 'info';
    const isCompleted = status === 'completed';
    const isError = status === 'error' || status === 'timeout';

    return (
        <div
            className={`robot-animation robot-${agentType} robot-${status}`}
            style={{
                width: size,
                height: size,
                color: theme.primary,
                '--robot-primary': theme.primary,
                '--robot-secondary': theme.secondary,
                '--robot-glow': theme.glow,
            } as React.CSSProperties}
        >
            <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="robot-svg"
            >
                {/* Glow effect for working state */}
                {isWorking && (
                    <defs>
                        <filter id={`glow-${agentType}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                )}

                {/* Agent-specific decoration */}
                {getAgentDecoration(agentType)}

                {/* Robot Body */}
                <g className="robot-body" filter={isWorking ? `url(#glow-${agentType})` : undefined}>
                    {/* Head */}
                    <rect
                        x="16"
                        y="14"
                        width="32"
                        height="24"
                        rx="4"
                        fill={theme.primary}
                        className="robot-head"
                    />

                    {/* Face plate */}
                    <rect
                        x="20"
                        y="18"
                        width="24"
                        height="16"
                        rx="2"
                        fill="white"
                        opacity="0.95"
                    />

                    {/* Eyes */}
                    <g className="robot-eyes">
                        <circle
                            cx="28"
                            cy="26"
                            r="3"
                            fill={isError ? '#DC2626' : theme.primary}
                            className="eye eye-left"
                        />
                        <circle
                            cx="36"
                            cy="26"
                            r="3"
                            fill={isError ? '#DC2626' : theme.primary}
                            className="eye eye-right"
                        />
                        {/* Eye shine */}
                        <circle cx="29" cy="25" r="1" fill="white" opacity="0.8" />
                        <circle cx="37" cy="25" r="1" fill="white" opacity="0.8" />
                    </g>

                    {/* Mouth - changes based on status */}
                    {isCompleted && (
                        <path
                            d="M26 30 Q32 34 38 30"
                            stroke={theme.primary}
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            className="mouth mouth-happy"
                        />
                    )}
                    {isError && (
                        <path
                            d="M26 32 Q32 28 38 32"
                            stroke="#DC2626"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            className="mouth mouth-sad"
                        />
                    )}
                    {!isCompleted && !isError && (
                        <rect
                            x="28"
                            y="30"
                            width="8"
                            height="2"
                            rx="1"
                            fill={theme.primary}
                            opacity="0.6"
                            className="mouth mouth-neutral"
                        />
                    )}

                    {/* Ears/Side panels */}
                    <rect x="12" y="20" width="4" height="12" rx="2" fill={theme.secondary} />
                    <rect x="48" y="20" width="4" height="12" rx="2" fill={theme.secondary} />

                    {/* Body */}
                    <rect
                        x="20"
                        y="40"
                        width="24"
                        height="16"
                        rx="3"
                        fill={theme.primary}
                        className="robot-torso"
                    />

                    {/* Chest light */}
                    <circle
                        cx="32"
                        cy="48"
                        r="4"
                        fill={isWorking ? theme.secondary : 'white'}
                        opacity={isWorking ? 1 : 0.5}
                        className="chest-light"
                    />

                    {/* Arms */}
                    <g className="robot-arms">
                        <rect
                            x="10"
                            y="42"
                            width="8"
                            height="12"
                            rx="2"
                            fill={theme.secondary}
                            className="arm arm-left"
                        />
                        <rect
                            x="46"
                            y="42"
                            width="8"
                            height="12"
                            rx="2"
                            fill={theme.secondary}
                            className="arm arm-right"
                        />
                    </g>
                </g>

                {/* Status indicators */}
                {isCompleted && (
                    <g className="status-completed" transform="translate(44, 10)">
                        <circle cx="8" cy="8" r="8" fill="#16A34A" />
                        <path
                            d="M4 8 L7 11 L12 5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </g>
                )}

                {isError && (
                    <g className="status-error" transform="translate(44, 10)">
                        <circle cx="8" cy="8" r="8" fill="#DC2626" />
                        <path
                            d="M5 5 L11 11 M11 5 L5 11"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </g>
                )}
            </svg>
        </div>
    );
};

export default RobotAnimation;
