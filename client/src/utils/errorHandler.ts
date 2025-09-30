export function handleNavigationError(error: Error, errorInfo?: any) {
  console.error('Navigation Error:', error, errorInfo);
  
  // You can add more sophisticated error handling here
  // For example, sending errors to a logging service
  
  // For now, just log to console
  if (import.meta.env.DEV) {
    console.group('🚨 Navigation Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  }
}

export function handleAsyncError(error: any, context: string) {
  console.error(`Async Error in ${context}:`, error);
  
  // Handle specific error types
  if (error.name === 'ChunkLoadError') {
    console.warn('Chunk load error detected, reloading page...');
    window.location.reload();
  }
  
  if (error.name === 'NetworkError') {
    console.warn('Network error detected');
  }
}
