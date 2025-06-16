import React, { useState } from 'react';
import { perplexityService } from '../services/ai/perplexity.service';

export const TestResearch: React.FC = () => {
  const [keyword, setKeyword] = useState('sustainable fashion');
  const [research, setResearch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testResearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting research for:', keyword);
      const result = await perplexityService.generateResearch(keyword);
      console.log('Research result:', result);
      setResearch(result);
    } catch (err: any) {
      console.error('Research error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Perplexity Research</h1>
      
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={testResearch}
          disabled={loading || !keyword}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Researching...' : 'Test Research'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {research && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Research Results:</h2>
          
          {research.definition && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Definition:</h3>
              <p>{research.definition}</p>
            </div>
          )}

          {research.currentTrends && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Current Trends:</h3>
              <ul className="list-disc list-inside space-y-1">
                {research.currentTrends.map((trend: string, i: number) => (
                  <li key={i}>{trend}</li>
                ))}
              </ul>
            </div>
          )}

          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-semibold">View Full JSON</summary>
            <pre className="mt-4 text-sm overflow-auto">
              {JSON.stringify(research, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};