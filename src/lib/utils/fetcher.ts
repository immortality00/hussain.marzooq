/**
 * A utility function for making fetch requests with error handling
 * @param url The API endpoint to fetch from
 * @param options Additional fetch options
 * @returns The JSON response data
 */
export const fetcher = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}; 