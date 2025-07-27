import { marked, Renderer } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';

export interface MarkdownTable {
  id: string;
  headers: string[];
  rows: string[][];
  metadata?: {
    sortable?: boolean;
    filterable?: boolean;
    exportable?: boolean;
    pagination?: boolean;
  };
}

export interface MarkdownContent {
  html: string;
  tables: MarkdownTable[];
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
    lastModified?: string;
    wordCount: number;
    readingTime: number;
  };
  toc: {
    level: number;
    text: string;
    id: string;
  }[];
}

export interface MarkdownParserOptions {
  enableTables?: boolean;
  enableCodeHighlighting?: boolean;
  enableTOC?: boolean;
  enableDataTables?: boolean;
  sanitizeHtml?: boolean;
  baseUrl?: string;
}

class MarkdownParser {
  private marked: typeof marked;
  private options: MarkdownParserOptions;

  constructor(options: MarkdownParserOptions = {}) {
    this.options = {
      enableTables: true,
      enableCodeHighlighting: true,
      enableTOC: true,
      enableDataTables: true,
      sanitizeHtml: true,
      ...options,
    };

    this.marked = marked;
    this.setupMarked();
  }

  private setupMarked() {
    // Configure marked with extensions
    this.marked.use(gfmHeadingId());
    
    if (this.options.enableCodeHighlighting) {
      this.marked.use(
        markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
            const language = Prism.languages[lang];
            if (language) {
              return Prism.highlight(code, language, lang);
            }
            return code;
          },
        })
      );
    }

    // Configure marked options
    this.marked.setOptions({
      gfm: true,
      breaks: false,
      pedantic: false,
    });

    // Custom renderer for enhanced table support
    if (this.options.enableDataTables) {
      const renderer = new Renderer();
      
      renderer.table = (token) => {
        const tableId = `table-${Math.random().toString(36).substr(2, 9)}`;
        return `<div class="markdown-table-container" data-table-id="${tableId}">
          <table class="markdown-table" id="${tableId}">
            <thead>${token.header}</thead>
            <tbody>${token.rows}</tbody>
          </table>
        </div>`;
      };

      renderer.tablerow = (token) => {
        return `<tr>${token.text}</tr>`;
      };

      renderer.tablecell = (token) => {
        const tag = token.header ? 'th' : 'td';
        const align = token.align ? ` style="text-align: ${token.align}"` : '';
        return `<${tag}${align}>${token.text}</${tag}>`;
      };

      this.marked.use({ renderer });
    }
  }

  async parse(markdown: string): Promise<MarkdownContent> {
    const startTime = Date.now();
    
    // Extract metadata from frontmatter
    const { content, metadata } = this.extractFrontmatter(markdown);
    
    // Generate table of contents
    const toc = this.options.enableTOC ? this.generateTOC(content) : [];
    
    // Extract and process tables
    const tables = this.options.enableDataTables ? this.extractTables(content) : [];
    
    // Parse markdown to HTML
    const html = await this.marked.parse(content);
    
    // Calculate reading statistics
    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute
    
    const parseTime = Date.now() - startTime;
    console.log(`Markdown parsed in ${parseTime}ms`);

    return {
      html,
      tables,
      metadata: {
        ...metadata,
        wordCount,
        readingTime,
      },
      toc,
    };
  }

  private extractFrontmatter(markdown: string): { content: string; metadata: any } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = markdown.match(frontmatterRegex);
    
    if (!match) {
      return { content: markdown, metadata: {} };
    }

    const frontmatter = match[1];
    const content = markdown.slice(match[0].length);
    
    try {
      // Simple YAML-like parsing for common frontmatter fields
      const metadata: any = {};
      const lines = frontmatter.split('\n');
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trim();
          
          // Handle arrays (tags)
          if (value.startsWith('[') && value.endsWith(']')) {
            metadata[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
          } else {
            metadata[key] = value.replace(/['"]/g, '');
          }
        }
      }
      
      return { content, metadata };
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error);
      return { content: markdown, metadata: {} };
    }
  }

  private generateTOC(markdown: string): { level: number; text: string; id: string }[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const toc: { level: number; text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      toc.push({ level, text, id });
    }

    return toc;
  }

  private extractTables(markdown: string): MarkdownTable[] {
    const tables: MarkdownTable[] = [];
    const tableRegex = /^\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm;
    let match;

    while ((match = tableRegex.exec(markdown)) !== null) {
      const headerRow = match[1];
      const bodyRows = match[2];

      // Parse headers
      const headers = headerRow.split('|')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      // Parse rows
      const rows: string[][] = [];
      const rowLines = bodyRows.split('\n').filter(line => line.trim().length > 0);
      
      for (const line of rowLines) {
        const cells = line.split('|')
          .map(c => c.trim())
          .filter((c, index, arr) => index > 0 && index < arr.length - 1); // Remove empty first/last elements
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      // Check for table metadata comments
      const tableId = `table-${Math.random().toString(36).substr(2, 9)}`;
      const metadata = this.parseTableMetadata(markdown, match.index);

      tables.push({
        id: tableId,
        headers,
        rows,
        metadata,
      });
    }

    return tables;
  }

  private parseTableMetadata(markdown: string, tableIndex: number): MarkdownTable['metadata'] {
    // Look for HTML comments before the table that contain metadata
    const beforeTable = markdown.slice(Math.max(0, tableIndex - 500), tableIndex);
    const metadataRegex = /<!--\s*table-meta:\s*({[^}]+})\s*-->/;
    const match = beforeTable.match(metadataRegex);

    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (error) {
        console.warn('Failed to parse table metadata:', error);
      }
    }

    return {
      sortable: true,
      filterable: true,
      exportable: true,
      pagination: false,
    };
  }

  private countWords(text: string): number {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  // Method to update parser options
  updateOptions(newOptions: Partial<MarkdownParserOptions>) {
    this.options = { ...this.options, ...newOptions };
    this.setupMarked();
  }

  // Method to add custom renderer
  addCustomRenderer(rendererFn: (renderer: Renderer) => void) {
    const renderer = new Renderer();
    rendererFn(renderer);
    this.marked.use({ renderer });
  }

  // Method to validate markdown syntax
  validateMarkdown(markdown: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Check for unclosed code blocks
      const codeBlockRegex = /```/g;
      const codeBlocks = markdown.match(codeBlockRegex);
      if (codeBlocks && codeBlocks.length % 2 !== 0) {
        errors.push('Unclosed code block detected');
      }

      // Check for malformed tables
      const lines = markdown.split('\n');
      let inTable = false;
      let tableHeaderCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('|') && line.endsWith('|')) {
          if (!inTable) {
            inTable = true;
            tableHeaderCount = line.split('|').length - 2;
          } else {
            const cellCount = line.split('|').length - 2;
            if (cellCount !== tableHeaderCount && !line.match(/^[\s|:-]+$/)) {
              errors.push(`Table row ${i + 1} has inconsistent column count`);
            }
          }
        } else if (inTable && line.length === 0) {
          inTable = false;
          tableHeaderCount = 0;
        }
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return { isValid: false, errors };
    }
  }
}

// Export singleton instance
export const markdownParser = new MarkdownParser();

// Export class for custom instances
export { MarkdownParser };

// Utility functions for markdown processing
export const markdownUtils = {
  // Convert HTML table back to markdown
  htmlTableToMarkdown(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) return '';

    const headers = Array.from(table.querySelectorAll('thead th'))
      .map(th => th.textContent?.trim() || '');
    
    const rows = Array.from(table.querySelectorAll('tbody tr'))
      .map(tr => Array.from(tr.querySelectorAll('td'))
        .map(td => td.textContent?.trim() || ''));

    let markdown = '| ' + headers.join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    for (const row of rows) {
      markdown += '| ' + row.join(' | ') + ' |\n';
    }

    return markdown;
  },

  // Extract all images from markdown
  extractImages(markdown: string): { alt: string; src: string; title?: string }[] {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g;
    const images: { alt: string; src: string; title?: string }[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      images.push({
        alt: match[1] || '',
        src: match[2],
        title: match[3],
      });
    }

    return images;
  },

  // Extract all links from markdown
  extractLinks(markdown: string): { text: string; url: string; title?: string }[] {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g;
    const links: { text: string; url: string; title?: string }[] = [];
    let match;

    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        title: match[3],
      });
    }

    return links;
  },

  // Generate markdown from structured data
  generateMarkdownTable(data: { headers: string[]; rows: string[][] }): string {
    if (!data.headers.length || !data.rows.length) return '';

    let markdown = '| ' + data.headers.join(' | ') + ' |\n';
    markdown += '| ' + data.headers.map(() => '---').join(' | ') + ' |\n';
    
    for (const row of data.rows) {
      markdown += '| ' + row.join(' | ') + ' |\n';
    }

    return markdown;
  },

  // Sanitize markdown content
  sanitizeMarkdown(markdown: string): string {
    // Remove potentially dangerous HTML tags
    const dangerousTags = /<(script|iframe|object|embed|form|input|button)[^>]*>.*?<\/\1>/gi;
    return markdown.replace(dangerousTags, '');
  },

  // Calculate markdown complexity score
  calculateComplexity(markdown: string): number {
    let score = 0;
    
    // Count different markdown elements
    score += (markdown.match(/^#{1,6}/gm) || []).length * 2; // Headers
    score += (markdown.match(/\*\*[^*]+\*\*/g) || []).length; // Bold
    score += (markdown.match(/\*[^*]+\*/g) || []).length; // Italic
    score += (markdown.match(/```[\s\S]*?```/g) || []).length * 5; // Code blocks
    score += (markdown.match(/`[^`]+`/g) || []).length; // Inline code
    score += (markdown.match(/^\|.+\|/gm) || []).length * 3; // Tables
    score += (markdown.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length * 2; // Images
    score += (markdown.match(/\[[^\]]+\]\([^)]+\)/g) || []).length; // Links
    
    return score;
  },
};