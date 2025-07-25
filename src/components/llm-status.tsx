'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Zap, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LLMStatus {
  status: string;
  connections: {
    groq: boolean;
    gemini: boolean;
  };
  currentProvider: {
    provider: string;
    model: string;
    fallbackAvailable: boolean;
  };
  usage: {
    groqDailyCount: number;
    groqMinuteCount: number;
    lastGroqRequest: string;
    services: {
      groqAvailable: boolean;
      geminiAvailable: boolean;
    };
  };
  environment: {
    groqConfigured: boolean;
    geminiConfigured: boolean;
  };
}

export function LLMStatusComponent() {
  const [status, setStatus] = useState<LLMStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/llm-status');
      const data = await response.json();
      
      if (data.status === 'error') {
        setError(data.error);
        setStatus(null);
      } else {
        setStatus(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LLM status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getProviderIcon = (provider: string) => {
    if (provider.includes('Groq')) return <Zap className="h-4 w-4 text-orange-500" />;
    if (provider.includes('Gemini')) return <Shield className="h-4 w-4 text-blue-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  const getProviderColor = (provider: string) => {
    if (provider.includes('Groq')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (provider.includes('Gemini')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading LLM Status...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl bg-white border border-red-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700">
            <AlertCircle className="h-5 w-5" />
            LLM Status Error
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStatus} className="text-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            {getProviderIcon(status.currentProvider.provider)}
            LLM Service Status
          </h3>
          <Button onClick={fetchStatus} className="text-sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Current Provider */}
          <div>
            <h4 className="font-semibold mb-2">Current Provider</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getProviderColor(status.currentProvider.provider)}`}>
                {status.currentProvider.provider}
              </span>
              <span className="text-sm text-gray-600">
                Model: {status.currentProvider.model}
              </span>
            </div>
            {status.currentProvider.fallbackAvailable && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Fallback provider available
              </p>
            )}
          </div>

          {/* Service Connections */}
          <div>
            <h4 className="font-semibold mb-2">Service Health</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.connections.groq ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">Groq Cloud</span>
                <span className={`px-2 py-1 rounded text-xs ${status.environment.groqConfigured ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                  {status.environment.groqConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.connections.gemini ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">Google Gemini</span>
                <span className={`px-2 py-1 rounded text-xs ${status.environment.geminiConfigured ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                  {status.environment.geminiConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Metrics */}
          {status.usage.services.groqAvailable && (
            <div>
              <h4 className="font-semibold mb-2">Groq Usage</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Daily requests:</span>
                  <div className="font-mono text-lg">{status.usage.groqDailyCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Per-minute requests:</span>
                  <div className="font-mono text-lg">{status.usage.groqMinuteCount}</div>
                </div>
              </div>
              {status.usage.lastGroqRequest && new Date(status.usage.lastGroqRequest).getTime() > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Last request: {new Date(status.usage.lastGroqRequest).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Integration Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>🚀 Groq Integration Active:</strong> Using Groq Cloud&apos;s llama-3.1-8b-instant as primary LLM
              with Google Gemini as fallback. This provides high-speed responses (~5x faster) with generous free-tier limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
