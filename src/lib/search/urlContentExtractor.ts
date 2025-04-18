
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    console.log('Fetching content from URL:', url);
    
    // Use a CORS proxy to avoid CORS issues
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(corsProxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Create a DOM parser to extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.getElementsByTagName('script');
    const styles = doc.getElementsByTagName('style');
    for (const element of [...Array.from(scripts), ...Array.from(styles)]) {
      element.parentNode?.removeChild(element);
    }
    
    // Get main content - prioritize content from article, main, or div with significant text
    let mainContent = '';
    const contentElements = doc.querySelectorAll('article, main, .content, #content, [role="main"]');
    if (contentElements.length > 0) {
      for (const element of Array.from(contentElements)) {
        mainContent += element.textContent || '';
      }
    } else {
      // Fallback to body content
      mainContent = doc.body.textContent || '';
    }
    
    // Clean up the text (remove extra whitespace, etc)
    const cleanedContent = mainContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000); // Limit content length
    
    console.log('Successfully extracted content from URL');
    return cleanedContent;
  } catch (error) {
    console.error('Error extracting content from URL:', error);
    return '';
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
