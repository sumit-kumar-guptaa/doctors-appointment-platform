/**
 * Medical AI Test Dashboard
 * Frontend component to test all AI systems
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MedicalAITestDashboard() {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState('all');

  const runSystemTests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-ai');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const runManualDiagnosisTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'diagnosis',
          symptoms: ['chest pain', 'shortness of breath', 'fatigue'],
          patientHistory: '45-year-old male, smoker, family history of heart disease',
          chiefComplaint: 'Experiencing chest pain and difficulty breathing for 3 hours',
          vitals: {
            heartRate: 110,
            bloodPressure: '150/95',
            temperature: 98.6,
            respiratoryRate: 24,
            oxygenSaturation: 94
          }
        })
      });
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Manual test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WORKING':
        return <Badge className="bg-green-500">✅ Working</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500">❌ Failed</Badge>;
      case 'ERROR':
        return <Badge className="bg-orange-500">⚠️ Error</Badge>;
      case 'CONNECTED':
        return <Badge className="bg-blue-500">🔗 Connected</Badge>;
      default:
        return <Badge className="bg-gray-500">❓ Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Medical AI Test Dashboard</h1>
        <p className="text-gray-600">Test all production AI systems to ensure they're working correctly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={runSystemTests}
          disabled={isLoading}
          className="h-12"
        >
          {isLoading ? '🔄 Testing Systems...' : '🚀 Run All System Tests'}
        </Button>
        
        <Button 
          onClick={runManualDiagnosisTest}
          disabled={isLoading}
          variant="outline"
          className="h-12"
        >
          {isLoading ? '🔄 Testing Diagnosis...' : '🩺 Test Medical Diagnosis'}
        </Button>
      </div>

      {testResults && (
        <div className="space-y-4">
          {testResults.error ? (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">❌ Test Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-500">{testResults.error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Environment Check */}
              {testResults.results?.environment && (
                <Card>
                  <CardHeader>
                    <CardTitle>🔧 Environment Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <span>Gemini API Key:</span>
                        {testResults.results.environment.geminiApiKey ? 
                          <Badge className="bg-green-500">✅ Set</Badge> : 
                          <Badge className="bg-red-500">❌ Missing</Badge>
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Google Translate Key:</span>
                        {testResults.results.environment.googleTranslateKey ? 
                          <Badge className="bg-green-500">✅ Set</Badge> : 
                          <Badge className="bg-orange-500">⚠️ Missing</Badge>
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Database URL:</span>
                        {testResults.results.environment.databaseUrl ? 
                          <Badge className="bg-green-500">✅ Set</Badge> : 
                          <Badge className="bg-red-500">❌ Missing</Badge>
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Database Status */}
              {testResults.results?.database && (
                <Card>
                  <CardHeader>
                    <CardTitle>🗄️ Database Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Connection Status:</span>
                      {getStatusBadge(testResults.results.database.status)}
                    </div>
                    {testResults.results.database.connection && (
                      <p className="mt-2 text-sm text-gray-600">
                        {testResults.results.database.connection}
                      </p>
                    )}
                    {testResults.results.database.error && (
                      <p className="mt-2 text-sm text-red-500">
                        Error: {testResults.results.database.error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI Systems Status */}
              {testResults.results?.systems && (
                <Card>
                  <CardHeader>
                    <CardTitle>🤖 AI Systems Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(testResults.results.systems).map(([system, data]) => (
                        <div key={system} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium capitalize">
                              {system.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h4>
                            {data.result && (
                              <p className="text-sm text-gray-600">{data.result}</p>
                            )}
                            {data.error && (
                              <p className="text-sm text-red-500">Error: {data.error}</p>
                            )}
                          </div>
                          {getStatusBadge(data.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Test Results */}
              {testResults.result && (
                <Card>
                  <CardHeader>
                    <CardTitle>🩺 Medical Diagnosis Test Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.result.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500">✅ Success</Badge>
                          <span className="text-sm">AI diagnosis generated successfully</span>
                        </div>
                        
                        {testResults.result.diagnosis && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">AI Diagnosis Summary:</h4>
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(testResults.result.diagnosis, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge className="bg-red-500">❌ Failed</Badge>
                        <p className="text-red-500">{testResults.result.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timestamp */}
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500">
                    Test completed at: {new Date(testResults.results?.timestamp || testResults.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">🔍 What This Tests:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• <strong>Medical Diagnosis AI:</strong> Tests Gemini API integration for medical analysis</li>
          <li>• <strong>Environment Variables:</strong> Checks if all required API keys are configured</li>
          <li>• <strong>Database Connection:</strong> Verifies Prisma connection to PostgreSQL</li>
          <li>• <strong>API Endpoints:</strong> Tests if all AI service APIs are accessible</li>
        </ul>
      </div>
    </div>
  );
}