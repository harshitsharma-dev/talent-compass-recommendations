
// Calculate cosine similarity between two vectors
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  // Guard against undefined or invalid vectors
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error('Invalid vectors provided to cosineSimilarity:', { vecA, vecB });
    return 0;
  }
  
  // Ensure vectors have the same length
  const minLength = Math.min(vecA.length, vecB.length);
  if (minLength === 0) {
    console.error('Empty vectors provided to cosineSimilarity');
    return 0;
  }
  
  console.log(`Computing similarity between vectors of lengths ${vecA.length} and ${vecB.length}, using ${minLength} dimensions`);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < minLength; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  // Guard against division by zero
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    console.error('Division by zero in cosineSimilarity');
    return 0;
  }
  
  return dotProduct / denominator;
};
