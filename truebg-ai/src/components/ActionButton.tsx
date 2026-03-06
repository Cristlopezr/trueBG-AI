interface ActionButtonProps {
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
    hasResult: boolean;
}

export const ActionButton = ({ onClick, disabled, isLoading, hasResult }: ActionButtonProps) => {
    return (
        <div className='flex justify-center'>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl flex items-center gap-3 w-full justify-center
                ${
                    disabled
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
                ) : hasResult ? (
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
    );
};
