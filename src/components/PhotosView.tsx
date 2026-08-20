import React, { useState } from 'react';
import { Image as ImageIcon, Cpu, Upload, Sparkles, Maximize2, Shield } from 'lucide-react';
import { cRuntime } from '../c-runtime/c_bridge';

export const PhotosView: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [cResizerBenchmark, setCResizerBenchmark] = useState<{
    width: number;
    height: number;
    durationUs: number;
    memoryKb: number;
  } | null>(null);

  const initialPhotos = [
    {
      id: '1',
      title: 'Old Campus Yard at Sunrise',
      album: 'Campus Architecture',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    },
    {
      id: '2',
      title: 'Michaelmas Formal Yard Ball',
      album: 'Collegiate Traditions',
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
    },
    {
      id: '3',
      title: 'Quantum Physics Optics Laboratory',
      album: 'Research & Labs',
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    },
    {
      id: '4',
      title: 'Varsity Crew Regatta on the Charles River',
      album: 'Athletics & Crew',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800',
    },
    {
      id: '5',
      title: 'Sterling Memorial Library Reading Room',
      album: 'Campus Architecture',
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
    },
    {
      id: '6',
      title: 'Hackathon Final Project Demos',
      album: 'Engineering & Hackathons',
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    },
  ];

  const handleTestCResizer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const start = performance.now();
    const mockImageBuffer = new Uint8Array(1920 * 1080 * 4); // 8MB RGBA buffer
    const resized = cRuntime.resizeImageBilinear(mockImageBuffer, 1920, 1080, 800, 450);
    const end = performance.now();

    setCResizerBenchmark({
      width: 800,
      height: 450,
      durationUs: Math.round((end - start) * 1000),
      memoryKb: Math.round(resized.byteLength / 1024),
    });
  };

  return (
    <div className="space-y-4" id="collegiate-photos-view">
      
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-900" />
            Collegiate Photo Registry & Media Albums
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Archival campus imagery, society galas, athletic regattas, and laboratory sessions
          </p>
        </div>

        {/* C Resizer Benchmark Runner */}
        <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 cursor-pointer transition-colors">
          <Cpu className="w-3.5 h-3.5 text-blue-800" />
          <span>Benchmark C Image Scaler</span>
          <input type="file" accept="image/*" onChange={handleTestCResizer} className="hidden" />
        </label>
      </div>

      {/* C Resizer Telemetry Banner */}
      {cResizerBenchmark && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs font-mono text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span className="font-bold">C-Runtime Client Image Pipeline:</span>
          </div>
          <div>
            Scaled 1080p → {cResizerBenchmark.width}x{cResizerBenchmark.height} in{' '}
            <strong className="text-blue-900">{cResizerBenchmark.durationUs} μs</strong> (Memory:{' '}
            {cResizerBenchmark.memoryKb} KB)
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {initialPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo.url)}
            className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs group cursor-pointer hover:border-blue-500 transition-all text-xs"
          >
            <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-2.5">
              <div className="font-bold text-slate-900 truncate font-serif">{photo.title}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                {photo.album}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div className="max-w-3xl max-h-[90vh] bg-white rounded overflow-hidden p-2 shadow-2xl relative">
            <img src={selectedPhoto} alt="" className="max-h-[80vh] w-auto object-contain mx-auto rounded" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/90 text-white rounded-full p-2 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
