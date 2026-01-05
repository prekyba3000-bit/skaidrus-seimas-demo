import React from 'react';
import { cn } from '@/lib/utils';

interface BalticPatternBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    variant?: 'sun' | 'tree' | 'simple';
}

export function BalticPatternBorder({
    children,
    className,
    variant = 'simple',
    ...props
}: BalticPatternBorderProps) {
    return (
        <div className={cn("relative p-[2px]", className)} {...props}>
            {/* Pattern Border Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <svg
                    className="w-full h-full absolute inset-0 text-[var(--amber-start)]/30 dark:text-[var(--amber-start)]/20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="baltic-pattern-simple"
                            x="0"
                            y="0"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M0 10 L10 0 L20 10 L10 20 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        </pattern>
                        <pattern
                            id="baltic-pattern-sun"
                            x="0"
                            y="0"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M20 5 L20 10 M20 30 L20 35 M5 20 L10 20 M30 20 L35 20 M9 9 L13 13 M27 27 L31 31 M9 31 L13 27 M27 13 L31 9" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>

                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill={variant === 'sun' ? "url(#baltic-pattern-sun)" : "url(#baltic-pattern-simple)"}
                        className="mask-border"
                        strokeWidth="4"
                        stroke="currentColor"
                        fillOpacity="0.2"
                    />
                </svg>

                {/* Solid Border Overlay */}
                <div className="absolute inset-0 border border-[var(--amber-start)]/20 rounded-lg pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 bg-[var(--card)] rounded-md h-full w-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
