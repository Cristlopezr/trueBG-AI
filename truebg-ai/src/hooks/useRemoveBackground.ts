import { useState, useRef } from 'react';
import { removeBackground } from '../services/rmbg-service';

export const useRemoveBackground = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setError(null);
        }
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveBackground = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        try {
            const { blob, filename } = await removeBackground(selectedFile);
            const resultImageUrl = URL.createObjectURL(blob);
            setResultUrl(resultImageUrl);
            setFilename(filename);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred connecting to the backend');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        selectedFile,
        previewUrl,
        resultUrl,
        isLoading,
        error,
        filename,
        fileInputRef,
        handleFileChange,
        clearSelection,
        handleRemoveBackground,
    };
};
