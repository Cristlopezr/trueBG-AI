import { useState, useRef } from 'react';
import './App.css';

function App() {
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

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/remove-background`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to remove background: ${response.statusText}`);
            }

            const contentDisposition = response.headers.get('Content-Disposition');

            let filename = 'output.png'; // fallback
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match?.[1]) {
                    filename = match[1];
                }
            }
            setFilename(filename);

            const blob = await response.blob();
            const resultImageUrl = URL.createObjectURL(blob);
            setResultUrl(resultImageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred connecting to the backend');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center py-12 px-4 font-sans selection:bg-indigo-500/30 overflow-x-hidden'>
            <div className={`w-full transition-all duration-700 ease-in-out ${resultUrl ? 'max-w-7xl' : 'max-w-3xl'}`}>
                <div className='text-center mb-10'>
                    <h1 className='text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text'>
                        TrueBG AI
                    </h1>
                    <p className='text-neutral-400 text-lg'>Remove backgrounds from your images instantly using AI.</p>
                </div>

                <div
                    className={`grid gap-8 items-start transition-all duration-700 ${resultUrl ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
                >
                    {/* Left Column / Main Column: Upload Area */}
                    <div className='bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-neutral-800 w-full'>
                        <h2 className='text-xl font-bold mb-6 text-neutral-200 text-center'>
                            {resultUrl ? 'Original Image' : 'Upload Image'}
                        </h2>
                        <div
                            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 mb-8 transition-all duration-300 overflow-hidden
                ${
                    previewUrl
                        ? 'border-neutral-700 bg-neutral-900/50'
                        : 'border-neutral-700 hover:border-indigo-500 hover:bg-neutral-800/50 cursor-pointer'
                }`}
                            onClick={() => !previewUrl && fileInputRef.current?.click()}
                        >
                            <input
                                type='file'
                                className='hidden'
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept='image/*'
                            />

                            {previewUrl ? (
                                <div className='relative w-full flex flex-col items-center'>
                                    <img
                                        src={previewUrl}
                                        alt='Original Preview'
                                        className='max-h-[400px] w-auto object-contain rounded-xl shadow-lg'
                                    />
                                    <button
                                        onClick={clearSelection}
                                        className='absolute top-2 right-2 bg-neutral-950/70 hover:bg-red-500/90 text-white rounded-full p-2 backdrop-blur-sm transition-colors'
                                        title='Clear selection'
                                    >
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className='text-center py-12 pointer-events-none'>
                                    <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 mb-6 group-hover:bg-indigo-500/20 transition-colors'>
                                        <svg
                                            className='h-10 w-10 text-indigo-400'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                                            />
                                        </svg>
                                    </div>
                                    <p className='text-xl font-medium text-neutral-200 mb-2'>
                                        Click to upload an image
                                    </p>
                                    <p className='text-neutral-500'>Supports JPG, PNG, WebP</p>
                                </div>
                            )}
                        </div>

                        <div className='flex justify-center'>
                            <button
                                onClick={handleRemoveBackground}
                                disabled={!selectedFile || isLoading || !!resultUrl}
                                className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl flex items-center gap-3 w-full justify-center
                  ${
                      !selectedFile || isLoading || resultUrl
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className='animate-spin h-6 w-6 text-indigo-300'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        Processing Image...
                                    </>
                                ) : resultUrl ? (
                                    <>
                                        <svg
                                            className='w-6 h-6 text-green-400'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M5 13l4 4L19 7'
                                            />
                                        </svg>
                                        Background Removed!
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                                            />
                                        </svg>
                                        Remove Background 🪄
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className='mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400'>
                                <svg className='w-6 h-6 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                </svg>
                                <p className='text-sm'>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Result Area (Only visible when resultUrl exists) */}
                    {resultUrl && (
                        <div className='bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-neutral-800 flex flex-col items-center w-full h-full justify-between animate-in fade-in slide-in-from-right-8 duration-700 opacity-100'>
                            <h2 className='text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center'>
                                Your Result is Ready
                            </h2>

                            <div
                                className='relative w-full rounded-2xl overflow-hidden flex justify-center items-center p-8 border border-neutral-800 flex-grow min-h-[300px]'
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0zm10 10h10v10H10z' fill='%23262626' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                }}
                            >
                                <img
                                    src={resultUrl}
                                    alt='Background Removed Result'
                                    className='max-h-[400px] w-auto object-contain drop-shadow-2xl'
                                />
                            </div>

                            <a
                                href={resultUrl}
                                download={filename}
                                className='mt-8 px-8 py-4 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-bold transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3'
                            >
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                                    />
                                </svg>
                                Download HD Image
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
