// src/components/HUD/DocumentViewer.tsx
import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { FileText, X } from 'lucide-react';

export default function DocumentViewer() {
  const documents = useGameStore((s) => s.documents);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);

  if (documents.length === 0) return null;

  return (
    <>
      <div className="absolute bottom-16 left-4 flex gap-2">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id)}
            className="bg-black/50 p-2 rounded-lg text-white hover:bg-black/70 flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">{doc.title}</span>
          </button>
        ))}
      </div>
      {selectedDoc !== null && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{documents.find(d => d.id === selectedDoc)?.title}</h2>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">
              {documents.find(d => d.id === selectedDoc)?.content}
            </p>
          </div>
        </div>
      )}
    </>
  );
}