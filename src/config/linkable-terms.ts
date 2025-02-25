/**
 * Configuration for linkable terms in AfroWiki articles
 */

interface LinkableTermConfig {
  term: string;
  category: 'event' | 'person' | 'location' | 'concept' | 'movement';
  aliases?: string[];
  description?: string;
}

// Terms that should be converted to links in articles
export const linkableTerms: LinkableTermConfig[] = [
  // Historical Events
  {
    term: 'Haitian Revolution',
    category: 'event',
    description: 'The successful slave revolt that led to Haiti\'s independence',
  },
  {
    term: 'French Revolution',
    category: 'event',
  },
  {
    term: 'Civil Rights Movement',
    category: 'movement',
    aliases: ['Civil Rights Era'],
  },

  // Historical Figures
  {
    term: 'Toussaint Louverture',
    category: 'person',
    aliases: ['Toussaint L\'Ouverture', 'François-Dominique Toussaint Louverture'],
  },
  {
    term: 'Jean-Jacques Dessalines',
    category: 'person',
  },
  {
    term: 'Henri Christophe',
    category: 'person',
  },

  // Locations
  {
    term: 'Haiti',
    category: 'location',
    aliases: ['Republic of Haiti'],
  },
  {
    term: 'Saint-Domingue',
    category: 'location',
    description: 'French colony that became Haiti',
  },
  {
    term: 'France',
    category: 'location',
  },

  // Concepts and Terms
  {
    term: 'slavery',
    category: 'concept',
    aliases: ['enslavement', 'slave trade'],
  },
  {
    term: 'colonialism',
    category: 'concept',
    aliases: ['colonial rule', 'colonial system'],
  },
  {
    term: 'Black republic',
    category: 'concept',
  },
];

// Rules for when to create links
export const linkingRules = {
  // Only link the first occurrence of a term in an article
  linkFirstOccurrenceOnly: true,
  
  // Don't link terms within these contexts
  excludeContexts: [
    'headings',
    'blockquotes',
    'code blocks',
    'links',
  ],
  
  // Don't link terms shorter than this length (prevents linking common words)
  minTermLength: 4,
  
  // Maximum number of links per paragraph (prevents over-linking)
  maxLinksPerParagraph: 5,
};

// Helper function to get all searchable terms including aliases
export function getAllSearchableTerms(): string[] {
  const terms = new Set<string>();
  
  linkableTerms.forEach(config => {
    terms.add(config.term.toLowerCase());
    if (config.aliases) {
      config.aliases.forEach(alias => terms.add(alias.toLowerCase()));
    }
  });
  
  return Array.from(terms);
}

// Helper function to get the canonical term for an alias
export function getCanonicalTerm(term: string): string {
  const lowerTerm = term.toLowerCase();
  
  // First check if it's a main term
  const mainTerm = linkableTerms.find(
    config => config.term.toLowerCase() === lowerTerm
  );
  if (mainTerm) return mainTerm.term;
  
  // Then check aliases
  const aliasedTerm = linkableTerms.find(
    config => config.aliases?.some(alias => alias.toLowerCase() === lowerTerm)
  );
  if (aliasedTerm) return aliasedTerm.term;
  
  // If no match found, return the original term
  return term;
}

// Helper function to check if a term should be linked
export function shouldLinkTerm(
  term: string,
  context: {
    isFirstOccurrence: boolean;
    isInExcludedContext: boolean;
    currentParagraphLinkCount: number;
  }
): boolean {
  // Don't link if term is too short
  if (term.length < linkingRules.minTermLength) return false;
  
  // Don't link in excluded contexts
  if (context.isInExcludedContext) return false;
  
  // Only link first occurrence if rule is enabled
  if (linkingRules.linkFirstOccurrenceOnly && !context.isFirstOccurrence) return false;
  
  // Don't exceed max links per paragraph
  if (context.currentParagraphLinkCount >= linkingRules.maxLinksPerParagraph) return false;
  
  return true;
}
