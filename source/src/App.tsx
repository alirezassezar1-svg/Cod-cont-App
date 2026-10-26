/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  ProjectFile,
  ConversionConfig,
  ConversionResult,
  ConvertedFile,
} from './types';
import { SAMPLE_PROJECTS } from './utils/sample-projects';
import { detectLanguage, generateDeterministicConversion } from './utils/converter-utils';
import { Header } from './components/Header';
import { StackConfigBar } from './components/StackConfigBar';
import { ProjectFileTree } from './components/ProjectFileTree';
import { CodeEditor } from './components/CodeEditor';
import { DiffViewer } from './components/DiffViewer';
import { ProjectAnalysisView } from './components/ProjectAnalysisView';
import { TargetStructureView } from './components/TargetStructureView';
import { DependenciesView } from './components/DependenciesView';
import { NewFileModal } from './components/NewFileModal';
import { AiSettingsModal } from './components/AiSettingsModal';
import { convertWithGemini, loadAiSettings, saveAiSettings } from './utils/gemini-client';
import { Sparkles } from 'lucide-react';

export default function App() {
  const initialSample = SAMPLE_PROJECTS[0];

  const [files, setFiles] = useState<ProjectFile[]>(initialSample.files);
  const [activeFileId, setActiveFileId] = useState<string>(initialSample.files[0]?.id || '');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(initialSample.id);

  const [config, setConfig] = useState<ConversionConfig>({
    sourceStack: initialSample.sourceStack,
    targetStack: initialSample.targetStack,
    useTypeScript: true,
    architecture: 'standard',
    preserveComments: true,
    stateStrategy: 'auto',
  });

  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies'
  >('editor');

  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [ai, setAi] = useState(loadAiSettings);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Convert Project Handler with Error and Retry Management
  const handleConvert = async () => {
    setIsConverting(true);
    setErrorMessage(null);
    const start = Date.now();

    try {
      let result: ConversionResult | null = null;
      if (ai.apiKey) {
        try {
          result = await convertWithGemini(files, config, ai.apiKey, ai.model);
        } catch (aiErr: any) {
          console.warn('Gemini failed, using local engine:', aiErr);
          setErrorMessage(`AI failed (${aiErr?.message || aiErr}) — used the built-in engine instead.`);
        }
      }
      if (!result) {
        result = generateDeterministicConversion(files, config);
      }
      result.latencyMs = result.latencyMs || Date.now() - start;
      setConversionResult(result);
      setActiveView('diff');
    } catch (fallbackErr: any) {
      setErrorMessage(fallbackErr?.message || 'Failed to transform project codebase. Please verify syntax.');
    } finally {
      setIsConverting(false);
    }
  };

  // Sample Switcher
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_PROJECTS.find((s) => s.id === sampleId);
    if (!sample) return;

    setSelectedSampleId(sample.id);
    setFiles(sample.files);
    setActiveFileId(sample.files[0]?.id || '');
    setConfig((prev) => ({
      ...prev,
      sourceStack: sample.sourceStack,
      targetStack: sample.targetStack,
    }));
    setConversionResult(null);
    setActiveView('editor');
  };

  // Reset to current sample
  const handleResetFiles = () => {
    const sample = SAMPLE_PROJECTS.find((s) => s.id === selectedSampleId) || SAMPLE_PROJECTS[0];
    setFiles(sample.files);
    setActiveFileId(sample.files[0]?.id || '');
    setConversionResult(null);
  };

  // File modification
  const handleUpdateContent = (id: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content: newContent, isModified: true } : f))
    );
  };

  // Add custom file
  const handleCreateFile = (filePath: string, content: string) => {
    const newFile: ProjectFile = {
      id: `file_${Date.now()}`,
      path: filePath,
      content: content || `// ${filePath}\n`,
      language: detectLanguage(filePath),
      isModified: true,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  // Delete file
  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  // Download single file
  const handleDownloadSingleFile = (file: ConvertedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'converted-file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export full project as ZIP
  const handleExportZip = async () => {
    if (!conversionResult) return;

    const zip = new JSZip();

    // Add all converted files into zip maintaining relative folders (strictly clean)
    for (const file of conversionResult.convertedFiles) {
      const cleanPath = file.path.trim();
      if (
        cleanPath.startsWith('.') ||
        cleanPath.includes('.playwright') ||
        cleanPath.includes('.aistudio') ||
        cleanPath.includes('node_modules') ||
        cleanPath.endsWith('.png') ||
        cleanPath.endsWith('.jpg') ||
        cleanPath.endsWith('.log')
      ) {
        continue;
      }
      zip.file(cleanPath, file.content);
    }

    // Add MIGRATION_GUIDE.md
    const migrationGuide = `# Project Migration Report: Code Converter Pro v4.0

Source Stack: ${config.sourceStack}
Target Stack: ${conversionResult.targetStack}
Monorepo Layout: ${conversionResult.recommendedTargetStructure.isMonorepo ? 'Yes' : 'No'}
Engine: ${conversionResult.engine || 'Gemini 3.8 Flash'}

## 1. Project Analysis
${conversionResult.projectAnalysis.sourceSummary}

### Key Architectural Decisions
${conversionResult.projectAnalysis.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## 2. Recommended Target Structure
\`\`\`
${conversionResult.recommendedTargetStructure.treeDescription}
\`\`\`

## 3. Dependency Updates
${
  conversionResult.dependencyUpdates.packageJson?.add
    ? `### Packages Added:
${Object.entries(conversionResult.dependencyUpdates.packageJson.add)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}`
    : ''
}

### Migration Gotchas
${conversionResult.migrationNotes.map((n) => `- ${n}`).join('\n')}
`;

    zip.file('MIGRATION_GUIDE.md', migrationGuide);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codebase-${config.targetStack}-converted.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Bar */}
      <Header
        onConvert={handleConvert}
        isConverting={isConverting}
        onExportZip={handleExportZip}
        hasConvertedResult={Boolean(conversionResult)}
        activeView={activeView}
        setActiveView={setActiveView}
        fileCount={files.length}
        engine={conversionResult?.engine}
        latencyMs={conversionResult?.latencyMs}
      />

      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-sky-700 bg-slate-900 px-4 py-2 text-xs font-medium text-sky-300 shadow-lg hover:bg-slate-800"
      >
        <Sparkles size={14} /> {ai.apiKey ? 'AI: ON' : 'AI: OFF'}
      </button>
      <AiSettingsModal
        key={String(isAiModalOpen)}
        isOpen={isAiModalOpen}
        initialKey={ai.apiKey}
        initialModel={ai.model}
        onClose={() => setIsAiModalOpen(false)}
        onSave={(apiKey, model) => {
          saveAiSettings(apiKey, model);
          setAi({ apiKey, model });
        }}
      />

      {/* Error / Retry Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-950 border-b border-rose-800 px-6 py-2 flex items-center justify-between text-xs text-rose-200">
          <span>{errorMessage}</span>
          <button
            onClick={handleConvert}
            className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded font-medium transition-colors"
          >
            Retry Conversion
          </button>
        </div>
      )}

      {/* Stack & Architecture Config Toolbar */}
      <StackConfigBar
        config={config}
        onChangeConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
        onSelectSample={handleSelectSample}
        selectedSampleId={selectedSampleId}
      />

      {/* Workbench Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source Project Tree (Always accessible on left) */}
        <ProjectFileTree
          files={files}
          selectedFileId={activeFileId}
          onSelectFile={(id) => {
            setActiveFileId(id);
            setActiveView('editor');
          }}
          onAddFileClick={() => setIsNewFileModalOpen(true)}
          onDeleteFile={handleDeleteFile}
          onResetFiles={handleResetFiles}
        />

        {/* Central Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
          {activeView === 'editor' && (
            <CodeEditor
              files={files}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
              onUpdateContent={handleUpdateContent}
            />
          )}

          {activeView === 'diff' && conversionResult && (
            <DiffViewer
              convertedFiles={conversionResult.convertedFiles}
              sourceFiles={files}
              onDownloadFile={handleDownloadSingleFile}
            />
          )}

          {activeView === 'analysis' && conversionResult && (
            <ProjectAnalysisView analysis={conversionResult.projectAnalysis} />
          )}

          {activeView === 'structure' && conversionResult && (
            <TargetStructureView structure={conversionResult.recommendedTargetStructure} />
          )}

          {activeView === 'dependencies' && conversionResult && (
            <DependenciesView
              updates={conversionResult.dependencyUpdates}
              migrationNotes={conversionResult.migrationNotes}
              targetStack={conversionResult.targetStack}
            />
          )}
        </main>
      </div>

      {/* New File Modal */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreateFile={handleCreateFile}
      />
    </div>
  );
}
