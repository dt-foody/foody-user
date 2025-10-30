// services/apiService.js

/**
 * A generic fetch function to call the backend API.
 * @param {string} endpoint - The endpoint to call.
 * @param {RequestInit} options - Optional fetch options.
 * @returns {Promise} - A promise with the parsed response data.
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
      credentials: "include", 
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw {
        message: errorData.message || "An unknown API error occurred",
        statusCode: response.status,
      };
    }

    return (await response.json()) as T;
  } catch (error) {
    throw {
      message: "A network error occurred. Please check your connection.",
    };
  }
};
