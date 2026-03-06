import './App.css';
import { useRemoveBackground } from './hooks/useRemoveBackground';
import { UploadArea } from './components/UploadArea';
import { ActionButton } from './components/ActionButton';
import { ResultPanel } from './components/ResultPanel';
import { ErrorBanner } from './components/ErrorBanner';

function App() {
    const {
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
    } = useRemoveBackground();

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
                    {/* Left Column: Upload Area */}
                    <div className='bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-neutral-800 w-full'>
                        <UploadArea
                            previewUrl={previewUrl}
                            fileInputRef={fileInputRef}
                            onFileChange={handleFileChange}
                            onClear={clearSelection}
                            hasResult={!!resultUrl}
                        />

                        <ActionButton
                            onClick={handleRemoveBackground}
                            disabled={!selectedFile || isLoading || !!resultUrl}
                            isLoading={isLoading}
                            hasResult={!!resultUrl}
                        />

                        {error && <ErrorBanner error={error} />}
                    </div>

                    {/* Right Column: Result */}
                    {resultUrl && <ResultPanel resultUrl={resultUrl} filename={filename} />}
                </div>
            </div>
        </div>
    );
}

export default App;
