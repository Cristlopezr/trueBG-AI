interface UploadAreaProps {
    previewUrl: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: (e: React.MouseEvent) => void;
    hasResult: boolean;
}

export const UploadArea = ({ previewUrl, fileInputRef, onFileChange, onClear, hasResult }: UploadAreaProps) => {
    return (
        <>
            <h2 className='text-xl font-bold mb-6 text-neutral-200 text-center'>
                {hasResult ? 'Original Image' : 'Upload Image'}
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
                    onChange={onFileChange}
                    accept='image/jpeg,image/png,image/webp'
                />

                {previewUrl ? (
                    <div className='relative w-full flex flex-col items-center'>
                        <img
                            src={previewUrl}
                            alt='Original Preview'
                            className='max-h-[400px] w-auto object-contain rounded-xl shadow-lg'
                        />
                        <button
                            onClick={onClear}
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
                        <p className='text-neutral-500'>Supports JPG, PNG, WebP · Max 10MB</p>
                    </div>
                )}
            </div>
        </>
    );
};
