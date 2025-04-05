import React, { useState } from 'react';
import { z } from 'zod';

interface FormData {
  siteType: string;
  baseUrl: string;
  contentTypes: string[];
  selectors: {
    title: string[];
    date: string[];
    content: string[];
    images: string[];
    author: string[];
    description: string[];
    category: string[];
  };
  urls: string[];
  stagingMode: boolean;
  stagingDomain: string;
}

const siteTypes = ['tilda', 'wordpress', 'custom'] as const;
const contentTypes = ['blog', 'portfolio', 'case-studies'] as const;

export default function OnboardingForm() {
  const [formData, setFormData] = useState<FormData>({
    siteType: 'tilda',
    baseUrl: '',
    contentTypes: [],
    selectors: {
      title: [''],
      date: [''],
      content: [''],
      images: [''],
      author: [''],
      description: [''],
      category: [''],
    },
    urls: [''],
    stagingMode: false,
    stagingDomain: '',
  });

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setResults(data.results);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addSelector = (field: keyof FormData['selectors']) => {
    setFormData(prev => ({
      ...prev,
      selectors: {
        ...prev.selectors,
        [field]: [...prev.selectors[field], ''],
      },
    }));
  };

  const addUrl = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, ''],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Content Migration Onboarding</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site Type</label>
            <select
              value={formData.siteType}
              onChange={(e) => setFormData(prev => ({ ...prev, siteType: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              {siteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base URL</label>
            <input
              type="url"
              value={formData.baseUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content Types</label>
          <div className="space-y-2">
            {contentTypes.map(type => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.contentTypes.includes(type)}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      contentTypes: e.target.checked
                        ? [...prev.contentTypes, type]
                        : prev.contentTypes.filter(t => t !== type),
                    }));
                  }}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Selectors</h2>
          {Object.entries(formData.selectors).map(([field, selectors]) => (
            <div key={field} className="space-y-2">
              <label className="block text-sm font-medium">{field}</label>
              {selectors.map((selector, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={selector}
                    onChange={(e) => {
                      const newSelectors = [...selectors];
                      newSelectors[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, [field]: newSelectors },
                      }));
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder={`${field} selector`}
                  />
                  {index === selectors.length - 1 && (
                    <button
                      type="button"
                      onClick={() => addSelector(field as keyof FormData['selectors'])}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Content URLs</label>
          {formData.urls.map((url, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newUrls = [...formData.urls];
                  newUrls[index] = e.target.value;
                  setFormData(prev => ({ ...prev, urls: newUrls }));
                }}
                className="flex-1 p-2 border rounded"
                placeholder="https://example.com/content"
              />
              {index === formData.urls.length - 1 && (
                <button
                  type="button"
                  onClick={addUrl}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Staging Options</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.stagingMode}
                onChange={(e) => setFormData(prev => ({ ...prev, stagingMode: e.target.checked }))}
              />
              <span>Enable Staging Mode</span>
            </label>

            {formData.stagingMode && (
              <div>
                <label className="block text-sm font-medium mb-2">Staging Domain</label>
                <input
                  type="text"
                  value={formData.stagingDomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, stagingDomain: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="staging.example.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This domain will be used for staging content before DNS update
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Start Migration'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded ${
                  result.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <h3 className="font-medium">{result.url}</h3>
                <p>Status: {result.status}</p>
                {result.stagingUrl && (
                  <p className="text-blue-600">
                    Staging URL: <a href={result.stagingUrl} target="_blank" rel="noopener noreferrer">{result.stagingUrl}</a>
                  </p>
                )}
                {result.error && <p className="text-red-700">{result.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 