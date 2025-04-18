
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    console.log('Fetching content from URL:', url);
    
    // Try multiple CORS proxies in sequence
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://crossorigin.me/${url}`
    ];
    
    let content = '';
    let success = false;
    let lastError = null;
    
    // Try each proxy until one works
    for (const proxyUrl of proxies) {
      try {
        console.log(`Attempting with proxy: ${proxyUrl.split('?')[0]}`);
        const response = await fetch(proxyUrl, { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        
        if (!response.ok) {
          console.log(`Failed with status: ${response.status}`);
          continue;
        }
        
        const html = await response.text();
        if (!html || html.length < 100) {
          console.log('Response too short, trying next proxy');
          continue;
        }
        
        // Create a DOM parser to extract text content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove script and style elements
        const scripts = doc.getElementsByTagName('script');
        const styles = doc.getElementsByTagName('style');
        for (const element of [...Array.from(scripts), ...Array.from(styles)]) {
          element.parentNode?.removeChild(element);
        }
        
        // Get main content - prioritize content from article, main, job descriptions
        let mainContent = '';
        const contentSelectors = [
          'article', 'main', '.content', '#content', '[role="main"]',
          '.job-description', '.description', '#job-details', '.job-details'
        ];
        
        const contentElements = doc.querySelectorAll(contentSelectors.join(', '));
        
        if (contentElements.length > 0) {
          for (const element of Array.from(contentElements)) {
            mainContent += element.textContent || '';
          }
        } else {
          // Fallback to body content with common noise removed
          const body = doc.body;
          const elementsToRemove = ['header', 'footer', 'nav', 'aside', '.sidebar'];
          elementsToRemove.forEach(selector => {
            Array.from(body.querySelectorAll(selector)).forEach(el => {
              el.parentNode?.removeChild(el);
            });
          });
          mainContent = body.textContent || '';
        }
        
        // Clean up the text
        content = mainContent
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 5000); // Limit content length
        
        if (content.length > 100) {
          success = true;
          break;
        } else {
          console.log('Extracted content too short, trying next proxy');
        }
      } catch (proxyError) {
        console.error(`Error with proxy ${proxyUrl.split('?')[0]}:`, proxyError);
        lastError = proxyError;
      }
    }
    
    if (success && content) {
      console.log('Successfully extracted content with length:', content.length);
      return content;
    }
    
    throw lastError || new Error('Could not extract content from any proxy');
  } catch (error) {
    console.error('Error extracting content from URL:', error);
    throw error;
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
