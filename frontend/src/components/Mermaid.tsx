// components/Mermaid.tsx
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

// mermaid.initialize({
//     startOnLoad: false,
//     theme: 'default',
//     securityLevel: 'strict',
//     logLevel: 5,
//     suppressErrorRendering: false,
// });

// const Mermaid1: React.FC<MermaidProps> = ({ chart }) => {
//     const containerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (containerRef.current) {
//             alert('Rendering Mermaid diagram');
//             mermaid.render('mermaid-diagram', chart, containerRef.current);
//         }
//     }, [chart]);

//     return <div ref={containerRef} />;
// };


const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize Mermaid to prevent auto-rendering
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict', // or adjust as needed
            theme: 'default',
            logLevel: 5,
            suppressErrorRendering: true,
        });

        const renderChart = async () => {
            const id = 'mermaid-chart'; // Unique ID for the diagram
            const diagramElement = chartRef.current;
            const [render_result, setRenderResult] = React.useState<any>(null);

            alert('Rendering Mermaid diagram');
            if (diagramElement) {

                // Clear previous content to avoid issues if the chart definition changes
                diagramElement.innerHTML = '';

                try {
                    // Call render to generate the diagram

                    const { svg } = await mermaid.render(id, chart);
                    setRenderResult(svg);
                    diagramElement.innerHTML = render_result;
                    render_result.bindFunctions?.(diagramElement)
                    console.info(svg)
                } catch (error) {
                    console.error('Mermaid rendering failed:', error);
                    diagramElement.innerHTML = '<p>Error rendering diagram.</p>';
                }
            }
        };

        renderChart();
    }, [chart]); // Re-render if the chartDefinition changes

    return (
        <div id="mermaid-chart" ref={chartRef} className="mermaid">
            {/* The rendered SVG will be placed here */}
        </div>
    );
}

export default Mermaid;