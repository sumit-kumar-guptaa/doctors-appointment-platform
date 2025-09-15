// Translation Panel Component for Real-time Medical Translation
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import medicalTranslator from '@/lib/medical-translator';

const TranslationPanel = ({ isVisible = true, onTranslationUpdate }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isListening, setIsListening] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [manualText, setManualText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [quickPhrases, setQuickPhrases] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);

  const translationHistoryRef = useRef(null);

  // Initialize translator
  useEffect(() => {
    const initializeTranslator = async () => {
      try {
        const success = await medicalTranslator.initialize();
        if (success) {
          setIsInitialized(true);
          setSupportedLanguages(medicalTranslator.getSupportedLanguages());
          setQuickPhrases(medicalTranslator.getMedicalPhrases(sourceLanguage));
          setAvailableVoices(medicalTranslator.getAvailableVoices(targetLanguage));
        }
      } catch (error) {
        console.error('Failed to initialize translator:', error);
      }
    };

    initializeTranslator();
  }, []);

  // Update quick phrases when source language changes
  useEffect(() => {
    if (isInitialized) {
      setQuickPhrases(medicalTranslator.getMedicalPhrases(sourceLanguage));
    }
  }, [sourceLanguage, isInitialized]);

  // Update available voices when target language changes
  useEffect(() => {
    if (isInitialized) {
      setAvailableVoices(medicalTranslator.getAvailableVoices(targetLanguage));
    }
  }, [targetLanguage, isInitialized]);

  // Start real-time translation
  const startRealTimeTranslation = async () => {
    try {
      setIsListening(true);
      
      await medicalTranslator.startRealTimeTranslation(
        sourceLanguage,
        targetLanguage,
        (translationResult) => {
          setCurrentTranslation(translationResult);
          
          if (translationResult.isFinal) {
            setTranslationHistory(prev => [translationResult, ...prev.slice(0, 19)]); // Keep last 20
            
            // Speak translation if voice is enabled
            if (voiceEnabled && translationResult.translated) {
              medicalTranslator.speakTranslation(translationResult.translated, targetLanguage)
                .catch(console.error);
            }

            // Notify parent component
            if (onTranslationUpdate) {
              onTranslationUpdate(translationResult);
            }
          }
        }
      );
    } catch (error) {
      console.error('Failed to start real-time translation:', error);
      setIsListening(false);
    }
  };

  // Stop real-time translation
  const stopRealTimeTranslation = () => {
    medicalTranslator.stopRealTimeTranslation();
    setIsListening(false);
    setCurrentTranslation(null);
  };

  // Manual text translation
  const translateManualText = async () => {
    if (!manualText.trim()) return;
    
    setIsTranslating(true);
    try {
      // Detect language if auto-detect is enabled
      if (sourceLanguage === 'auto') {
        const detected = await medicalTranslator.detectLanguage(manualText);
        setDetectedLanguage(detected);
        setSourceLanguage(detected);
      }

      const result = await medicalTranslator.translateText(
        manualText,
        sourceLanguage,
        targetLanguage
      );

      const translationResult = {
        original: manualText,
        translated: result.translatedText,
        isFinal: true,
        confidence: result.confidence,
        timestamp: Date.now(),
        source: result.source
      };

      setTranslationHistory(prev => [translationResult, ...prev.slice(0, 19)]);
      setManualText('');

      // Speak translation if voice is enabled
      if (voiceEnabled && result.translatedText) {
        medicalTranslator.speakTranslation(result.translatedText, targetLanguage)
          .catch(console.error);
      }

      // Notify parent component
      if (onTranslationUpdate) {
        onTranslationUpdate(translationResult);
      }
    } catch (error) {
      console.error('Manual translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Translate quick phrase
  const translateQuickPhrase = async (phrase) => {
    setManualText(phrase);
    await translateManualText();
  };

  // Swap languages
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  // Clear history
  const clearHistory = () => {
    setTranslationHistory([]);
    medicalTranslator.clearHistory();
  };

  // Export translation session
  const exportSession = () => {
    const session = medicalTranslator.exportTranslationSession();
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-translation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Scroll to bottom of history
  useEffect(() => {
    if (translationHistoryRef.current) {
      translationHistoryRef.current.scrollTop = translationHistoryRef.current.scrollHeight;
    }
  }, [translationHistory]);

  if (!isVisible) return null;

  const getLanguageFlag = (code) => {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.flag : '🌐';
  };

  const getLanguageName = (code) => {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🌍 Medical Translation System
          {!isInitialized && <Badge variant="outline" className="text-yellow-600">Initializing...</Badge>}
          {isListening && <Badge variant="default" className="bg-red-500 animate-pulse">🔴 Live</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">From</label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={!isInitialized}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{getLanguageFlag(sourceLanguage)}</span>
                    <span>{getLanguageName(sourceLanguage)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🌐 Auto Detect</SelectItem>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapLanguages}
              disabled={!isInitialized || sourceLanguage === 'auto'}
              className="rounded-full w-10 h-10 p-0"
            >
              ⇄
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">To</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={!isInitialized}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{getLanguageFlag(targetLanguage)}</span>
                    <span>{getLanguageName(targetLanguage)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {!isListening ? (
            <Button
              onClick={startRealTimeTranslation}
              disabled={!isInitialized}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🎤 Start Live Translation
            </Button>
          ) : (
            <Button
              onClick={stopRealTimeTranslation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ⏹ Stop Translation
            </Button>
          )}

          <Button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            variant={voiceEnabled ? "default" : "outline"}
            disabled={!isInitialized}
          >
            {voiceEnabled ? '🔊' : '🔇'} Voice
          </Button>

          <Button
            onClick={clearHistory}
            variant="outline"
            disabled={translationHistory.length === 0}
          >
            🗑 Clear History
          </Button>

          <Button
            onClick={exportSession}
            variant="outline"
            disabled={translationHistory.length === 0}
          >
            📥 Export
          </Button>
        </div>

        {/* Manual Translation */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Manual Translation</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type medical text to translate..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  translateManualText();
                }
              }}
              disabled={!isInitialized}
            />
            <Button
              onClick={translateManualText}
              disabled={!isInitialized || !manualText.trim() || isTranslating}
              className="px-6"
            >
              {isTranslating ? '⏳' : '📝'} Translate
            </Button>
          </div>
          {detectedLanguage && (
            <div className="text-xs text-gray-600">
              Detected language: {getLanguageName(detectedLanguage)} {getLanguageFlag(detectedLanguage)}
            </div>
          )}
        </div>

        {/* Quick Medical Phrases */}
        {quickPhrases.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Medical Phrases</label>
            <div className="flex flex-wrap gap-2">
              {quickPhrases.slice(0, 6).map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => translateQuickPhrase(phrase)}
                  disabled={!isInitialized}
                  className="text-xs"
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Current Translation */}
        {currentTranslation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">🔴 Live Translation</h3>
            <div className="space-y-2">
              <div className="text-gray-700">
                <span className="font-medium">Original:</span> {currentTranslation.original}
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Translation:</span> {currentTranslation.translated}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-white text-xs ${getConfidenceColor(currentTranslation.confidence)}`}
                >
                  {Math.round(currentTranslation.confidence * 100)}% confidence
                </Badge>
                {!currentTranslation.isFinal && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Processing...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Translation History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Translation History</label>
            <Badge variant="outline" className="text-xs">
              {translationHistory.length} translations
            </Badge>
          </div>
          
          <div
            ref={translationHistoryRef}
            className="max-h-60 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-4"
          >
            {translationHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No translations yet. Start speaking or type to begin translation.
              </div>
            ) : (
              translationHistory.map((translation, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {new Date(translation.timestamp).toLocaleTimeString()}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-white text-xs ${getConfidenceColor(translation.confidence)}`}
                    >
                      {Math.round(translation.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="text-gray-700">
                    <span className="font-medium text-xs text-gray-500 uppercase">Original:</span>
                    <div className="mt-1">{translation.original}</div>
                  </div>
                  
                  <div className="text-blue-700">
                    <span className="font-medium text-xs text-gray-500 uppercase">Translation:</span>
                    <div className="mt-1 font-medium">{translation.translated}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getLanguageFlag(sourceLanguage)} → {getLanguageFlag(targetLanguage)}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (voiceEnabled) {
                          medicalTranslator.speakTranslation(translation.translated, targetLanguage)
                            .catch(console.error);
                        }
                      }}
                      disabled={!voiceEnabled}
                      className="h-6 w-6 p-0 text-xs"
                      title="Play translation"
                    >
                      🔊
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Voices */}
        {availableVoices.length > 0 && (
          <div className="text-xs text-gray-500">
            Available voices for {getLanguageName(targetLanguage)}: {availableVoices.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationPanel;