/// <reference types="vite/client" />

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // extends React's HTMLAttributes
        allowpopups?: string;
        useragent?: string;
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                useragent?: string;
                allowpopups?: string;
                partition?: string;
            };
        }
    }

    interface Window {
        ipcRenderer: {
            setGeminiKey: (key: string) => Promise<void>;
            // Add other exposed methods here if needed
        };
    }
}
