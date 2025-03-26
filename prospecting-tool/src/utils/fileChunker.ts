// src/utils/fileChunker.ts

/**
 * Splits a large file into smaller chunks for upload
 * @param file The file to split
 * @param chunkSize The size of each chunk in bytes (default: 8MB)
 * @returns Array of file chunks
 */
export const splitFileIntoChunks = (file: File, chunkSize: number = 8 * 1024 * 1024): Blob[] => {
  const chunks: Blob[] = [];
  let start = 0;
  
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    chunks.push(chunk);
    start = end;
  }
  
  return chunks;
};

/**
 * Creates a unique ID for a file upload session
 * @returns A unique ID string
 */
export const createUploadSessionId = (): string => {
  return `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Creates a filename for a chunk
 * @param originalFilename The original filename
 * @param sessionId The upload session ID
 * @param chunkIndex The index of the chunk
 * @param totalChunks The total number of chunks
 * @returns The chunk filename
 */
export const createChunkFilename = (
  originalFilename: string,
  sessionId: string,
  chunkIndex: number,
  totalChunks: number
): string => {
  return `${sessionId}-${chunkIndex.toString().padStart(5, '0')}_${totalChunks.toString().padStart(5, '0')}-${originalFilename}`;
};
