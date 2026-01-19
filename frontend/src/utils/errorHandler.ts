/**
 * Utility function to extract error messages from various error types
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  if (typeof error === "object" && error !== null) {
    // Handle Axios errors
    if ("response" in error) {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      return axiosError.response?.data?.message || 
             axiosError.response?.data?.error || 
             defaultMessage;
    }
    
    // Handle other object errors
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
  }
  
  return defaultMessage;
};

/**
 * Safely log errors without exposing sensitive information
 */
export const logError = (error: unknown, context: string): void => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  }
  // In production, you might want to send to error tracking service
};
