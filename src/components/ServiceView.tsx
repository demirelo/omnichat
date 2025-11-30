import React from 'react';
import { getScraperScript } from '../services/MessageScraper';
import { memoryService } from '../services/MemoryService';

interface ServiceViewProps {
    id: string;
    url: string;
    isActive: boolean;
    userAgent?: string;
    onUnreadUpdate: (id: string, count: number) => void;
}

export const ServiceView: React.FC<ServiceViewProps> = ({ id, url, isActive, userAgent, onUnreadUpdate }) => {
    const webviewRef = React.useRef<any>(null);

    React.useEffect(() => {
        const webview = webviewRef.current;
        if (webview) {
            const handleTitleUpdate = (e: any) => {
                const title = e.title || '';
                // Look for (N) pattern in title
                const match = title.match(/\((\d+)\)/);
                const count = match ? parseInt(match[1], 10) : 0;
                onUnreadUpdate(id, count);
            };

            webview.addEventListener('page-title-updated', handleTitleUpdate);

            // Also check on dom-ready just in case
            webview.addEventListener('dom-ready', () => {
                // Initial check if title is already set
                if (webview.getTitle) {
                    const title = webview.getTitle();
                    const match = title.match(/\((\d+)\)/);
                    const count = match ? parseInt(match[1], 10) : 0;
                    onUnreadUpdate(id, count);
                }

                // Inject Message Scraper
                // We cast to any because executeJavaScript might not be in the type definition for React ref
                (webview as any).executeJavaScript(getScraperScript(id));

                // Inject link click interceptor
                (webview as any).executeJavaScript(`
                    (function() {
                        console.log('Link click interceptor loaded');
                        
                        // Intercept all clicks
                        document.addEventListener('click', function(e) {
                            // Find the closest anchor tag
                            let target = e.target;
                            while (target && target.tagName !== 'A') {
                                target = target.parentElement;
                            }
                            
                            if (target && target.tagName === 'A') {
                                const href = target.href;
                                console.log('Link clicked:', href);
                                
                                // Check if it's an external link
                                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                                    const currentDomain = window.location.hostname;
                                    try {
                                        const targetDomain = new URL(href).hostname;
                                        
                                        if (currentDomain !== targetDomain) {
                                            console.log('External link detected, preventing default and opening externally:', href);
                                            e.preventDefault();
                                            e.stopPropagation();
                                            
                                            // Send message to open in external browser
                                            window.open(href, '_blank');
                                        }
                                    } catch (err) {
                                        console.error('Error parsing URL:', err);
                                    }
                                }
                            }
                        }, true); // Use capture phase to catch before Slack's handlers
                    })();
                `);
            });

            const handleConsoleMessage = (e: any) => {
                const msg = e.message || '';
                if (msg.startsWith('__OMNICHAT_MSG__:')) {
                    try {
                        const data = JSON.parse(msg.substring('__OMNICHAT_MSG__:'.length));
                        if (data.type === 'new_message' || data.type === 'new_text') {
                            memoryService.addMessage(id, data.content);
                        }
                    } catch (err) {
                        // console.error('Failed to parse scraper message', err);
                    }
                }
            };

            webview.addEventListener('console-message', handleConsoleMessage);

            // Polling for Telegram (since it doesn't update title reliably)
            let pollInterval: NodeJS.Timeout;
            if (id === 'telegram') {
                pollInterval = setInterval(async () => {
                    try {
                        // Telegram Web K uses .badge class for unread counts
                        // We sum up all numbers found in .badge elements
                        const count = await webview.executeJavaScript(`
                            (() => {
                                let total = 0;
                                const badges = document.querySelectorAll('.badge, .unread');
                                badges.forEach(b => {
                                    const val = parseInt(b.innerText);
                                    if (!isNaN(val)) total += val;
                                });
                                return total;
                            })()
                        `);
                        onUnreadUpdate(id, count);
                    } catch (err) {
                        // console.error('Failed to poll Telegram unread:', err);
                    }
                }, 3000);
            }

            return () => {
                webview.removeEventListener('page-title-updated', handleTitleUpdate);
                webview.removeEventListener('console-message', handleConsoleMessage);
                if (pollInterval) clearInterval(pollInterval);
            };
        }
    }, [id, onUnreadUpdate]);

    return (
        <div
            className={`absolute inset-0 w-full h-full bg-white ${isActive ? 'z-10 visible' : 'z-0 invisible'}`}
        >
            <webview
                ref={webviewRef}
                src={url}
                useragent={userAgent}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowpopups={true}
                partition={`persist:${id}`}
            />
        </div>
    );
};
