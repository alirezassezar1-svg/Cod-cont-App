/**
 * Browser-side Gemini client. The API key is entered by the user and kept only
 * in this browser's localStorage — it is never part of the repo or the build.
 */
import { ConversionConfig, ConversionResult, ProjectFile } from '../types';

export const DEFAULT_MODEL = 'gemini-3.8-flash';
const KEY_STORAGE = 'cc_gemini_key';
const MODEL_STORAGE = 'cc_gemini_model';

export function loadAiSettings(): { apiKey: string; model: string } {
  try {
    return {
      apiKey: localStorage.getItem(KEY_STORAGE) || '',
      model: localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL,
    };
  } catch {
    return { apiKey: '', model: DEFAULT_MODEL };
  }
}

export function saveAiSettings(apiKey: string, model: string) {
  try {
    if (apiKey) localStorage.setItem(KEY_STORAGE, apiKey);
    else localStorage.removeItem(KEY_STORAGE);
    localStorage.setItem(MODEL_STORAGE, model || DEFAULT_MODEL);
  } catch {
    /* storage unavailable */
  }
}

const str = { type: 'STRING' };
const strArr = { type: 'ARRAY', items: str };

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    projectAnalysis: {
      type: 'OBJECT',
      properties: {
        sourceSummary: str,
        relationships: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { from: str, to: str, type: str, description: str },
            required: ['from', 'to', 'type'],
          },
        },
        sharedModules: strArr,
        keyDecisions: strArr,
      },
      required: ['sourceSummary', 'relationships', 'sharedModules', 'keyDecisions'],
    },
    recommendedTargetStructure: {
      type: 'OBJECT',
      properties: {
        isMonorepo: { type: 'BOOLEAN' },
        treeDescription: str,
        fileMapping: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { source: str, target: str, reason: str },
            required: ['source', 'target', 'reason'],
          },
        },
      },
      required: ['isMonorepo', 'treeDescription', 'fileMapping'],
    },
    convertedFiles: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          path: str,
          originalPath: str,
          content: str,
          language: str,
          explanation: str,
          status: str,
        },
        required: ['path', 'content', 'language', 'explanation'],
      },
    },
    dependencyUpdates: {
      type: 'OBJECT',
      properties: { notes: strArr },
      required: ['notes'],
    },
    migrationNotes: strArr,
  },
  required: [
    'projectAnalysis',
    'recommendedTargetStructure',
    'convertedFiles',
    'dependencyUpdates',
    'migrationNotes',
  ],
};

function buildPrompt(files: ProjectFile[], config: ConversionConfig): string {
  const filesSummary = files
    .map((f) => `### File: ${f.path}\n\`\`\`${f.language || 'text'}\n${f.content}\n\`\`\``)
    .join('\n\n');

  return `You are Code Converter Pro v4.0, an elite principal engineer specializing in large-scale code migrations and multi-file framework transformations.

Convert this entire multi-file project from "${config.sourceStack}" to "${config.targetStack}".
Architectural structure: ${config.architecture} (isMonorepo: ${config.architecture === 'monorepo'})
TypeScript: ${config.useTypeScript ? 'Enabled' : 'Disabled'}
State strategy: ${config.stateStrategy}

Strict conversion instructions:
1. Understand and preserve relationships between files (imports, shared types, props, hooks/stores).
2. Redesign folder structure according to the target framework's best practices (e.g. if monorepo, packages/ui, packages/shared, apps/web).
3. If converting React -> Vue 3, use <script setup lang="ts"> and Pinia. If Vue -> React, use React 19 functional hooks. If Blade -> Inertia, place under resources/js/Pages and resources/js/Components.
4. Output strict JSON matching the schema with:
   - projectAnalysis: summary of source architecture, relationships, shared modules, key decisions
   - recommendedTargetStructure: isMonorepo, treeDescription, fileMapping
   - convertedFiles: array of { path, originalPath, content, language, explanation, status }
   - dependencyUpdates: packageJson additions/removals/scripts and notes
   - migrationNotes: array of important gotchas

Here are the source files:
${filesSummary}`;
}

export async function convertWithGemini(
  files: ProjectFile[],
  config: ConversionConfig,
  apiKey: string,
  model: string,
  timeoutMs = 90000
): Promise<ConversionResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: buildPrompt(files, config) }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      let detail = '';
      try {
        detail = (await res.json())?.error?.message || '';
      } catch {
        /* ignore */
      }
      throw new Error(`Gemini API ${res.status}${detail ? `: ${detail}` : ''}`);
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    if (!text) throw new Error('Gemini returned an empty response');

    const parsed = JSON.parse(text);
    parsed.engine = DEFAULT_MODEL; // label type is fixed in types.ts
    parsed.latencyMs = Date.now() - started;
    parsed.targetStack = config.targetStack;
    parsed.convertedAt = new Date().toISOString();
    return parsed as ConversionResult;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Gemini request timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
