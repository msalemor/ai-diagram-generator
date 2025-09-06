// Mermaid.tsx
import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import type { MermaidDiagramProps } from "./MermaidDiagram.types";

export type MermaidProps = {
    /** Mermaid diagram source */
    chart: string;
    /** Optional per-diagram configuration merged over global init */
    props: MermaidDiagramProps | null;
    className?: string;
    onError?: (error: any) => void;
};

let initialized = false;

export const Mermaid2: React.FC<MermaidProps> = ({ chart, props, className, onError }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    // Stable, unique id for mermaid.render (react re-renders won't change this)
    //const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

    // Initialize Mermaid once for the app
    useEffect(() => {
        if (!initialized) {
            mermaid.initialize({
                startOnLoad: false,     // we'll render manually
                securityLevel: props?.securityLevel || 'strict',
                theme: props?.theme || "default",
                logLevel: props?.logLevel || 5,
            });
            initialized = true;
        }
    }, [chart]);

    // Render whenever the chart changes
    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            if (!containerRef.current) return;

            try {
                // mermaid.render returns { svg, bindFunctions? }
                const { svg, bindFunctions } = await mermaid.render(
                    'svg-mermaid', //idRef.current,
                    chart,
                    containerRef.current
                );

                if (cancelled) return;

                // Inject the SVG into the container
                containerRef.current.innerHTML = svg;

                // Wire up events (tooltips/clicks) if present
                bindFunctions?.(containerRef.current);
            } catch (err) {
                // You can surface error state in your UI here
                onError?.(err);
                // console.error("Mermaid render failed", err);
                // if (containerRef.current) {
                //     containerRef.current.innerHTML = `<pre style="color:#b00">Mermaid render error</pre>`;
                // }
            }
        };

        render();
        return () => {
            cancelled = true;
        };
    }, [chart]);

    return <div ref={containerRef} className={className} />;
};
