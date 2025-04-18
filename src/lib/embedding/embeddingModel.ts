
// Cache for embeddings to avoid redundant API calls
let embeddingCache: { [text: string]: number[] } = {};

export const getEmbeddings = async (texts: string[]): Promise<{ data: number[][] }> => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Check cache first
  const cachedResults = texts.map(text => embeddingCache[text]);
  if (cachedResults.every(result => result !== undefined)) {
    return { data: cachedResults };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: texts,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Cache the embeddings
    texts.forEach((text, index) => {
      embeddingCache[text] = result.data[index].embedding;
    });

    return { data: result.data.map((item: any) => item.embedding) };
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};
