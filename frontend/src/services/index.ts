import axios from "axios"
import { useEffect, useState } from "react"

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