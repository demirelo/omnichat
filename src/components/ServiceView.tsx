import React from 'react';

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
            });

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
