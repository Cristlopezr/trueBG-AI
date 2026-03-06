interface RemoveBackgroundResult {
    blob: Blob;
    filename: string;
}

export const removeBackground = async (file: File): Promise<RemoveBackgroundResult> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/remove-background`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        console.error(`Remove background failed: ${response.status} ${response.statusText}`);

        const errorMessages: Record<number, string> = {
            413: 'The image is too large. Please upload an image under 10MB.',
            429: 'Too many requests. Please wait a moment and try again.',
        };

        throw new Error(errorMessages[response.status] ?? 'Something went wrong while processing your image. Please try again.');
    }

    const contentDisposition = response.headers.get('Content-Disposition');

    let filename = 'output.png';
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) {
            filename = match[1];
        }
    }

    const blob = await response.blob();
    return { blob, filename };
};
