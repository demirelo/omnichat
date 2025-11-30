
export type Platform = 'slack' | 'discord' | 'telegram' | 'gmail' | 'generic';

export const getScraperScript = (platform: string): string => {
  const selectors = {
    slack: {
      container: '.c-virtual_list__scroll_container',
      message: '.c-message__body',
      sender: '.c-message__sender_link',
      timestamp: '.c-timestamp__label'
    },
    discord: {
      container: '[class^="scrollerInner"]', // Generic scroller class often used
      message: '[id^="message-content"]',
      sender: '[class^="username"]',
      timestamp: 'time'
    },
    telegram: {
      container: '.bubble-content-wrapper', // Needs verification, Telegram Web K/Z differ
      message: '.message',
      sender: '.peer-title',
      timestamp: '.time'
    },
    gmail: {
      container: '.UI', // Main container
      message: '.zA', // Email row (unread/read)
      sender: '.yP, .zF', // Sender name
      timestamp: '.xW' // Date
    },
    generic: {
      container: 'body',
      message: '',
      sender: '',
      timestamp: ''
    }
  };

  // We use a generic observer that looks for text additions
  // This is a simplified version. For production, we'd need robust selectors.
  return `
    (() => {
      console.log('[OmniChat] Injecting Scraper for ${platform}...');
      
      const sendToHost = (data) => {
        // We use a special prefix to identify our messages in the console stream
        console.log('__OMNICHAT_MSG__:' + JSON.stringify(data));
      };

      const selectors = ${JSON.stringify(selectors[platform as keyof typeof selectors] || selectors.generic)};
      
      let lastProcessedText = '';

      const isMessageContent = (node) => {
         if (!node) return false;
         // If we have specific selectors, check them
         if (selectors.message) {
             if (node.nodeType === Node.ELEMENT_NODE) {
                 if (node.matches(selectors.message) || node.closest(selectors.message)) return true;
             }
             if (node.nodeType === Node.TEXT_NODE) {
                 if (node.parentElement && node.parentElement.closest(selectors.message)) return true;
             }
             return false;
         }
         return true; // Fallback for generic
      };

      const processNode = (node) => {
        // Filter out obvious UI noise if possible
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.closest('nav') || node.closest('header') || node.closest('.sidebar')) return;
        }

        if (!isMessageContent(node)) return;

        if (node.nodeType === Node.TEXT_NODE) {
           // Text node added
           const text = node.textContent?.trim();
           if (text && text.length > 0 && text !== lastProcessedText) {
             lastProcessedText = text;
             sendToHost({ type: 'new_text', content: text, timestamp: Date.now() });
           }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
           // Element added, check its text content
           const el = node;
           const text = el.innerText?.trim();
           if (text && text.length > 0 && text !== lastProcessedText) {
              // Simple de-bouncing/de-duping
              lastProcessedText = text;
              sendToHost({ type: 'new_message', content: text, timestamp: Date.now() });
           }
        }
      };

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            processNode(node);
          }
        }
      });

      // Start observing the body for now, can be refined to specific containers
      observer.observe(document.body, { childList: true, subtree: true });
      
      sendToHost({ type: 'status', content: 'Scraper active' });
    })();
  `;
};
