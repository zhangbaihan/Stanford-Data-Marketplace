'use client';

interface CanvasProps {
  html: string | null;
}

export default function Canvas({ html }: CanvasProps) {
  if (!html) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50/50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-medium text-gray-900 mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Empty Canvas
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Visualization will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        title="Data Visualization"
      />
    </div>
  );
}
