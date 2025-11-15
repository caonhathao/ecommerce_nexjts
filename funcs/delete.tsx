type QueryParams = Record<string, string | number | boolean | null | undefined>;

export const deleteData = async (baseUrl: string, params: QueryParams) => {
  try {
    // 1. Build the URL with query parameters
    const searchParams = new URLSearchParams();

    // Iterate over the params object and append them to the URL
    Object.entries(params).forEach(([key, value]) => {
      // Only append if the value is not null or undefined
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    // Only add '?' if there are actually parameters
    const queryString = searchParams.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    return response;
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error('Failed to post data:', error);
    throw e; // Re-throw the error after logging it
  }
};
