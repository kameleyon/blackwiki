# Article Linking Guidelines for AfroWiki Authors

This document outlines the guidelines for creating links within AfroWiki articles. The platform automatically processes articles to create links based on these guidelines, but understanding them will help you write more effective content.

## What Gets Linked?

### 1. Key Concepts and Terms
- Historical events (e.g., "Haitian Revolution", "French Revolution")
- Significant historical periods (e.g., "Colonial Era", "Reconstruction Period")
- Major movements or ideologies (e.g., "Civil Rights Movement", "Pan-Africanism")

### 2. Notable People
- Historical figures (e.g., "Toussaint Louverture", "Frederick Douglass")
- Leaders and influential individuals
- Use full names on first mention for proper linking

### 3. Geographic Locations
- Countries directly involved in the narrative (e.g., "Haiti", "France")
- Important cities or regions (e.g., "Saint-Domingue", "Harlem")
- Only when the location has historical significance to the topic

### 4. Related Topics
- Concepts that deserve their own articles (e.g., "slavery", "colonialism")
- Terms that readers might want to learn more about
- Concepts central to understanding the article

## Linking Rules

### First Occurrence Only
- Terms are only linked the first time they appear in an article
- Subsequent mentions remain unlinked for better readability
- Exception: If a term appears far apart in a very long article, it may be linked again

### Context Matters
- Terms are not linked in headings
- Terms are not linked in blockquotes
- Terms are not linked in code blocks
- Terms are not linked if they're already part of a link

### Density Guidelines
- Maximum of 5 links per paragraph to prevent over-linking
- Terms must be at least 4 characters long to be linked
- Links should enhance understanding, not distract from reading

## Writing Best Practices

### 1. Use Full Names
```markdown
✅ "Toussaint Louverture led the rebellion..."
❌ "Toussaint led the rebellion..."
```

### 2. Use Canonical Terms
```markdown
✅ "The Haitian Revolution began in 1791..."
❌ "The revolution of Saint-Domingue began in 1791..."
```

### 3. Be Consistent with Terms
```markdown
✅ "The Civil Rights Movement transformed America..."
❌ "The Civil Rights Era transformed America..."
```

### 4. Avoid Overloading
```markdown
✅ "Haiti gained independence after the revolution."
❌ "Haiti gained independence after Haiti's revolution in Haiti."
```

## Technical Implementation

The platform automatically:
- Identifies linkable terms based on a curated list
- Handles variations and aliases of terms
- Enforces linking rules and density guidelines
- Maintains consistent styling for links

## Examples

### Good Example
```markdown
The Haitian Revolution (1791-1804) was led by Toussaint Louverture. The 
revolution began in Saint-Domingue, which was then a French colony. Louverture's 
leadership transformed the slave uprising into a full revolution.
```

In this example:
- "Haitian Revolution" is linked on first occurrence
- "Toussaint Louverture" is linked using his full name
- "Saint-Domingue" and "French" are linked as relevant locations
- Subsequent mention of "Louverture" is not linked
- "revolution" is not linked as it's too generic

### Poor Example
```markdown
The revolution in Haiti was led by Toussaint. The Saint-Domingue uprising 
started when Toussaint Louverture organized the slaves. Toussaint then led 
Haiti to victory.
```

Problems with this example:
- Misses opportunity to link "Haitian Revolution"
- Inconsistent use of the historical figure's name
- Over-mentions "Toussaint" without adding value
- Uses different terms for the same event ("revolution", "uprising")

## Automatic Processing

The platform's markdown processor will:
1. Identify linkable terms in your content
2. Create appropriate links for first occurrences
3. Apply consistent styling to all links
4. Ensure proper link density and distribution

You don't need to manually create links - focus on writing clear, consistent content using proper terminology.

## Questions and Support

If you have questions about linking guidelines or need help with article formatting, please:
1. Check the existing documentation
2. Review similar articles for examples
3. Contact the editorial team for clarification

Remember: The goal of linking is to enhance reader understanding while maintaining readability and flow.
