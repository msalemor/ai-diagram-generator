import axios from 'axios';
import mermaid from 'mermaid';
import { useEffect, useState } from 'react';

export interface IMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}
export interface ICompletionResponse {
    id: string
    object: string
    created: number
    model: string
    choices: {
        index: number
        message: IMessage
        finish_reason: string
    }[]
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}
export async function completion(endpoint: string, apiKey: string, messages: IMessage[], temperature = 0.1): Promise<string> {
    try {
        if (messages.length == 0 || endpoint == '' || apiKey == '') {
            return ''
        }
        const payload = {
            messages: messages,
            temperature: temperature,
        }
        const resp = await axios.post<ICompletionResponse>(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })
        return resp.data.choices[0].message.content
    } catch (error) {
        console.error('Error fetching completion:', error);
    }
    return ''
}

export interface MermaidResponse {
    svg: SVGElement;
    code: string;
    error: any | null;
}

export async function mermaidToSvg(chartCode: string, system = '', prompt: string = '', endpoint: string = '', apiKey: string = '', retryCount: number = 3): Promise<MermaidResponse> {
    // Initialize mermaid with default config
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'strict',
        suppressErrorRendering: true,
    });

    // Create a temporary container
    const id = `mermaid-chart`; //${Date.now()}`;
    // const container = document.createElement('div');
    // container.id = id;
    // container.style.display = 'none';
    // document.body.appendChild(container);

    let retries = retryCount
    let lastError: any | null = null
    while (retries > 0) {
        try {
            let code = chartCode
            // Render the mermaid chart
            if (chartCode.trim() === '' && prompt.trim() !== '') {
                code = await completion(endpoint,
                    apiKey,
                    [{ role: 'system', content: system || 'You are a Mermaid code generation assistant.' },
                    { role: 'user', content: prompt }]);
                console.info('Generated mermaid code:', code);
            }
            const { svg } = await mermaid.render(id, code);

            // Parse the SVG string into an SVG element
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
            const svgElement = svgDoc.documentElement as unknown as SVGElement;

            return { svg: svgElement, code, error: null };
        } catch (error) {
            retries--;
            if (retries === 0) {
                console.error('Error rendering mermaid chart:', error);
                lastError = error
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return { svg: null as unknown as SVGElement, code: '', error: lastError };
    // finally {
    //     // Clean up the temporary container
    //     //container.remove();
    // }
}

export function useLocalStorage(key: string, initialValue: any) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error, return initialValue
            console.log(error);
            return initialValue;
        }
    });

    // useEffect to update local storage when the state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.log(error);
        }
    }, [key, storedValue]); // Dependency array ensures effect runs when key or storedValue changes

    return [storedValue, setStoredValue];
}