import type { RelationshipConfig, GitHubSyncConfig } from '../types';
import { initialRelationshipConfig, normalizeRelationshipConfig } from '../data/relationshipData';

const DB_NAME = 'nosotros_cms_db';
const DB_VERSION = 1;
const STORE_NAME = 'site_data';
const CONFIG_KEY = 'current_config';
const UNPUBLISHED_FLAG_KEY = 'nosotros_has_unpublished_changes';
const GITHUB_CONFIG_KEY = 'nosotros_github_sync_config';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveConfigToLocalDB(
  config: RelationshipConfig,
  markUnpublished = true
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(config, CONFIG_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    if (markUnpublished) {
      localStorage.setItem(UNPUBLISHED_FLAG_KEY, 'true');
    }
  } catch (err) {
    console.warn('Fallback to localStorage:', err);
    try {
      localStorage.setItem('nosotros_fallback_config', JSON.stringify(config));
      if (markUnpublished) {
        localStorage.setItem(UNPUBLISHED_FLAG_KEY, 'true');
      }
    } catch (e) {
      console.error('Could not save config to storage:', e);
    }
  }
}

export async function loadConfigFromLocalDB(): Promise<RelationshipConfig | null> {
  try {
    const db = await openDB();
    const result = await new Promise<RelationshipConfig | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CONFIG_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (result) {
      return normalizeRelationshipConfig(result);
    }
  } catch (err) {
    console.warn('Error reading IndexedDB:', err);
  }

  // Fallback or migrate legacy localStorage keys
  const fallback = localStorage.getItem('nosotros_fallback_config');
  if (fallback) {
    try {
      return normalizeRelationshipConfig(JSON.parse(fallback));
    } catch {
      // ignore
    }
  }

  return null;
}

export async function clearLocalDB(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(CONFIG_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
  localStorage.removeItem('nosotros_fallback_config');
  localStorage.removeItem('nosotros_daughter');
  localStorage.removeItem('nosotros_memories');
  localStorage.removeItem(UNPUBLISHED_FLAG_KEY);
}

/**
 * Loads the initial configuration:
 * 1. If local browser has unpublished Admin edits, prioritizes local DB so Admin never loses work.
 * 2. Otherwise tries fetching `./data/siteContent.json` (published via GitHub Pages).
 * 3. Falls back to `initialRelationshipConfig`.
 */
export async function loadSiteConfiguration(): Promise<RelationshipConfig> {
  const hasUnpublished = localStorage.getItem(UNPUBLISHED_FLAG_KEY) === 'true';
  let localConfig = await loadConfigFromLocalDB();

  // If localConfig contains legacy Unsplash placeholder URLs, purge it so real photos load!
  if (localConfig && JSON.stringify(localConfig).includes('images.unsplash.com')) {
    console.log('Purging legacy Unsplash placeholder data from local storage...');
    await clearLocalDB();
    localConfig = null;
  }

  if (hasUnpublished && localConfig) {
    return localConfig;
  }

  // Try fetching published siteContent.json from static server / GitHub Pages
  try {
    const res = await fetch(`./data/siteContent.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const remoteJson = await res.json();
      const normalized = normalizeRelationshipConfig(remoteJson);
      await saveConfigToLocalDB(normalized, false);
      return normalized;
    }
  } catch {
    // Offline or not present yet
  }

  if (localConfig) {
    return localConfig;
  }

  return normalizeRelationshipConfig(initialRelationshipConfig);
}

export function hasUnpublishedChanges(): boolean {
  return localStorage.getItem(UNPUBLISHED_FLAG_KEY) === 'true';
}

export function markChangesPublished(): void {
  localStorage.removeItem(UNPUBLISHED_FLAG_KEY);
}

/**
 * Auto-detects GitHub Pages owner & repo from URL if hosted on github.io
 */
export function detectGitHubRepoFromUrl(): { owner: string; repo: string } {
  if (typeof window === 'undefined') return { owner: '', repo: '' };
  const host = window.location.hostname;
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  if (host.endsWith('.github.io')) {
    const owner = host.replace('.github.io', '');
    const repo = pathParts[0] || `${owner}.github.io`;
    return { owner, repo };
  }
  return { owner: '', repo: '' };
}

export function loadGitHubSyncConfig(): GitHubSyncConfig {
  const saved = localStorage.getItem(GITHUB_CONFIG_KEY);
  const detected = detectGitHubRepoFromUrl();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        owner: parsed.owner || detected.owner || '',
        repo: parsed.repo || detected.repo || '',
        branch: parsed.branch || 'main',
        token: parsed.token || '',
      };
    } catch {
      // ignore
    }
  }
  return {
    owner: detected.owner,
    repo: detected.repo,
    branch: 'main',
    token: '',
  };
}

export function saveGitHubSyncConfig(cfg: GitHubSyncConfig): void {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(cfg));
}
