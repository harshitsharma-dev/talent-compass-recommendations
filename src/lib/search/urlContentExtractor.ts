
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    console.log('Fetching content from URL:', url);
    const response = await fetch(url);
    const html = await response.text();
    
    // Create a DOM parser to extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.getElementsByTagName('script');
    const styles = doc.getElementsByTagName('style');
    for (const element of [...scripts, ...styles]) {
      element.remove();
    }
    
    // Get text content
    const textContent = doc.body.textContent || '';
    
    // Clean up the text (remove extra whitespace, etc)
    const cleanedContent = textContent
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
