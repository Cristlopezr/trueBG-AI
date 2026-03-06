interface ResultPanelProps {
    resultUrl: string;
    filename: string | null;
}

export const ResultPanel = ({ resultUrl, filename }: ResultPanelProps) => {
    return (
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
    );
};
