interface ErrorBannerProps {
    error: string;
}

export const ErrorBanner = ({ error }: ErrorBannerProps) => {
    return (
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
    );
};
