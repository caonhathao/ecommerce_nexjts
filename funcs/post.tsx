export const postData = async (url: string, body: Record<string, any>) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(body),
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
