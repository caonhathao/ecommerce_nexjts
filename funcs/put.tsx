export const putData = async ({
  url,
  body,
  contentType = undefined,
}: {
  url: string;
  body: FormData | Record<string, string | number>;
  contentType?: string | undefined;
}) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  };

  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: !contentType ? (body as BodyInit) : JSON.stringify(body),
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
