import type { RelationshipConfig } from '../types';
import defaultSiteContent from './defaultSiteContent.json';

export const initialRelationshipConfig: RelationshipConfig =
  defaultSiteContent as RelationshipConfig;

/**
 * Ensures any partial or older saved config has all required nested objects
 */
export function normalizeRelationshipConfig(
  raw?: Partial<RelationshipConfig> | null
): RelationshipConfig {
  if (!raw) return structuredClone(initialRelationshipConfig);

  return {
    ...initialRelationshipConfig,
    ...raw,
    adminPassword: raw.adminPassword || initialRelationshipConfig.adminPassword,
    hero: {
      ...initialRelationshipConfig.hero,
      ...(raw.hero || {}),
    },
    daughter: {
      ...initialRelationshipConfig.daughter,
      ...(raw.daughter || {}),
      ultrasoundImages:
        raw.daughter?.ultrasoundImages ??
        initialRelationshipConfig.daughter.ultrasoundImages,
      bornImages:
        raw.daughter?.bornImages ??
        initialRelationshipConfig.daughter.bornImages ??
        [],
      bornGalleryTitle:
        raw.daughter?.bornGalleryTitle ??
        initialRelationshipConfig.daughter.bornGalleryTitle,
      milestones:
        raw.daughter?.milestones ??
        initialRelationshipConfig.daughter.milestones ??
        [],
      checklist:
        raw.daughter?.checklist ?? initialRelationshipConfig.daughter.checklist,
    },
    timelineSection: {
      ...initialRelationshipConfig.timelineSection,
      ...(raw.timelineSection || {}),
      categories:
        raw.timelineSection?.categories?.length
          ? raw.timelineSection.categories
          : initialRelationshipConfig.timelineSection.categories,
    },
    memories: Array.isArray(raw.memories)
      ? raw.memories
      : initialRelationshipConfig.memories,
    lettersSection: {
      ...initialRelationshipConfig.lettersSection,
      ...(raw.lettersSection || {}),
    },
    letters: Array.isArray(raw.letters)
      ? raw.letters
      : initialRelationshipConfig.letters,
    footer: {
      ...initialRelationshipConfig.footer,
      ...(raw.footer || {}),
    },
    appearance: {
      ...initialRelationshipConfig.appearance,
      ...(raw.appearance || {}),
      floatingSymbols:
        raw.appearance?.floatingSymbols?.length
          ? raw.appearance.floatingSymbols
          : initialRelationshipConfig.appearance.floatingSymbols,
    },
  };
}
