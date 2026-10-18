import type { RelationshipConfig, GitHubSyncConfig, MediaItem } from '../types';

export interface SyncProgress {
  step: string;
  percentage: number;
}

function getExtensionFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  const mime = match ? match[1] : 'image/webp';
  const map: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return map[mime] || 'webp';
}

async function githubRequest<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(`Error de GitHub (${response.status}): ${errorDetail}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Verifies if the GitHub token and repository are valid and writable
 */
export async function verifyGitHubConnection(
  gh: GitHubSyncConfig
): Promise<{ fullName: string; defaultBranch: string; canPush: boolean }> {
  if (!gh.owner || !gh.repo || !gh.token) {
    throw new Error('Completa Usuario, Repositorio y Token de GitHub.');
  }

  const data = await githubRequest<{
    full_name: string;
    default_branch: string;
    permissions?: { push?: boolean };
  }>(
    `https://api.github.com/repos/${gh.owner.trim()}/${gh.repo.trim()}`,
    gh.token
  );

  return {
    fullName: data.full_name,
    defaultBranch: data.default_branch || 'main',
    canPush: data.permissions?.push ?? true,
  };
}

/**
 * Publishes the entire site configuration and any newly uploaded base64 media files
 * into the GitHub repository in a single atomic commit.
 */
export async function publishToGitHub(
  config: RelationshipConfig,
  gh: GitHubSyncConfig,
  onProgress?: (progress: SyncProgress) => void
): Promise<RelationshipConfig> {
  const owner = gh.owner.trim();
  const repo = gh.repo.trim();
  const branch = gh.branch.trim() || 'main';
  const token = gh.token.trim();

  if (!owner || !repo || !token) {
    throw new Error(
      'Faltan los datos de conexión de GitHub (Usuario, Repositorio o Token). Configúralos en la pestaña Seguridad & GitHub.'
    );
  }

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const updatedConfig: RelationshipConfig = structuredClone(config);

  onProgress?.({ step: 'Conectando con el repositorio de GitHub...', percentage: 10 });

  // 1. Get current branch reference & latest commit SHA
  const refData = await githubRequest<{ object: { sha: string } }>(
    `${baseUrl}/git/ref/heads/${branch}`,
    token
  );
  const latestCommitSha = refData.object.sha;

  // 2. Get base tree SHA from latest commit
  const commitData = await githubRequest<{ tree: { sha: string } }>(
    `${baseUrl}/git/commits/${latestCommitSha}`,
    token
  );
  const baseTreeSha = commitData.tree.sha;

  // 3. Collect all media items that have base64 data: URLs to upload as files
  const pendingUploads: Array<{ item: MediaItem; prefix: string }> = [];

  updatedConfig.daughter.ultrasoundImages?.forEach((item, idx) => {
    if (item.url && item.url.startsWith('data:')) {
      pendingUploads.push({ item, prefix: `vaiolet-${idx + 1}` });
    }
  });

  updatedConfig.memories.forEach((mem) => {
    mem.media.forEach((item, idx) => {
      if (item.url && item.url.startsWith('data:')) {
        pendingUploads.push({ item, prefix: `${mem.id}-${idx + 1}` });
      }
    });
  });

  const treeEntries: Array<{
    path: string;
    mode: '100644';
    type: 'blob';
    sha: string;
  }> = [];

  // 4. Upload each base64 media file as a Git Blob
  const timestamp = Date.now();
  for (let i = 0; i < pendingUploads.length; i++) {
    const { item, prefix } = pendingUploads[i];
    const pct = 20 + Math.round(((i + 1) / (pendingUploads.length + 1)) * 50);
    onProgress?.({
      step: `Subiendo archivo multimedia ${i + 1} de ${pendingUploads.length}...`,
      percentage: pct,
    });

    const ext = getExtensionFromDataUrl(item.url);
    const base64Content = item.url.split(',')[1];
    const fileName = `${prefix}-${timestamp}-${i}.${ext}`;
    const repoFilePath = `public/media/${fileName}`;

    const blobRes = await githubRequest<{ sha: string }>(
      `${baseUrl}/git/blobs`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          content: base64Content,
          encoding: 'base64',
        }),
      }
    );

    treeEntries.push({
      path: repoFilePath,
      mode: '100644',
      type: 'blob',
      sha: blobRes.sha,
    });

    // Replace data URL with clean relative path for GitHub Pages
    item.url = `./media/${fileName}`;
  }

  onProgress?.({
    step: 'Empaquetando textos y configuración del sitio...',
    percentage: 75,
  });

  // 5. Create Blob for public/data/siteContent.json
  const jsonContent = JSON.stringify(updatedConfig, null, 2);
  const jsonBlobRes = await githubRequest<{ sha: string }>(
    `${baseUrl}/git/blobs`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        content: jsonContent,
        encoding: 'utf-8',
      }),
    }
  );

  treeEntries.push({
    path: 'public/data/siteContent.json',
    mode: '100644',
    type: 'blob',
    sha: jsonBlobRes.sha,
  });

  onProgress?.({
    step: 'Creando versión en el árbol de Git...',
    percentage: 85,
  });

  // 6. Create new Git Tree
  const newTree = await githubRequest<{ sha: string }>(
    `${baseUrl}/git/trees`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeEntries,
      }),
    }
  );

  onProgress?.({
    step: 'Guardando commit en el repositorio...',
    percentage: 92,
  });

  // 7. Create Commit
  const newCommit = await githubRequest<{ sha: string }>(
    `${baseUrl}/git/commits`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        message: 'chore(admin): actualizar contenido y multimedia del sitio',
        tree: newTree.sha,
        parents: [latestCommitSha],
      }),
    }
  );

  // 8. Update Branch Reference
  await githubRequest(
    `${baseUrl}/git/refs/heads/${branch}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({
        sha: newCommit.sha,
        force: false,
      }),
    }
  );

  onProgress?.({
    step: '¡Publicado con éxito en GitHub!',
    percentage: 100,
  });

  return updatedConfig;
}
