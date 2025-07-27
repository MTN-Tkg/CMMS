import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Code,
  Clock,
  BookOpen,
  ChevronUp,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { markdownParser, type MarkdownContent, type MarkdownTable } from '@/utils/markdown-parser';
import { useToast } from '@/hooks/use-toast';

interface MarkdownViewerProps {
  content: string;
  className?: string;
  showMetadata?: boolean;
  showTOC?: boolean;
  enableTableFeatures?: boolean;
  onContentChange?: (content: string) => void;
}

interface TableState {
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  filterText: string;
  currentPage: number;
  pageSize: number;
}

export function MarkdownViewer({
  content,
  className = '',
  showMetadata = true,
  showTOC = true,
  enableTableFeatures = true,
  onContentChange,
}: MarkdownViewerProps) {
  const [parsedContent, setParsedContent] = useState<MarkdownContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'rendered' | 'source'>('rendered');
  const [tableStates, setTableStates] = useState<Record<string, TableState>>({});
  const { toast } = useToast();

  // Parse markdown content
  useEffect(() => {
    const parseContent = async () => {
      if (!content.trim()) {
        setParsedContent(null);
        return;
      }

      setIsLoading(true);
      try {
        const parsed = await markdownParser.parse(content);
        setParsedContent(parsed);
        
        // Initialize table states
        const initialTableStates: Record<string, TableState> = {};
        parsed.tables.forEach(table => {
          initialTableStates[table.id] = {
            sortColumn: null,
            sortDirection: 'asc',
            filterText: '',
            currentPage: 1,
            pageSize: 10,
          };
        });
        setTableStates(initialTableStates);
      } catch (error) {
        console.error('Failed to parse markdown:', error);
        toast({
          title: 'Parsing Error',
          description: 'Failed to parse markdown content',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    parseContent();
  }, [content, toast]);

  // Enhanced table component
  const EnhancedTable = ({ table }: { table: MarkdownTable }) => {
    const tableState = tableStates[table.id] || {
      sortColumn: null,
      sortDirection: 'asc' as const,
      filterText: '',
      currentPage: 1,
      pageSize: 10,
    };

    const updateTableState = (updates: Partial<TableState>) => {
      setTableStates(prev => ({
        ...prev,
        [table.id]: { ...tableState, ...updates },
      }));
    };

    // Filter and sort data
    const processedData = useMemo(() => {
      let filtered = table.rows;

      // Apply filter
      if (tableState.filterText) {
        filtered = filtered.filter(row =>
          row.some(cell =>
            cell.toLowerCase().includes(tableState.filterText.toLowerCase())
          )
        );
      }

      // Apply sort
      if (tableState.sortColumn !== null) {
        const columnIndex = table.headers.indexOf(tableState.sortColumn);
        if (columnIndex !== -1) {
          filtered = [...filtered].sort((a, b) => {
            const aVal = a[columnIndex] || '';
            const bVal = b[columnIndex] || '';
            
            // Try numeric sort first
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return tableState.sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // Fallback to string sort
            return tableState.sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          });
        }
      }

      return filtered;
    }, [table, tableState]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / tableState.pageSize);
    const paginatedData = processedData.slice(
      (tableState.currentPage - 1) * tableState.pageSize,
      tableState.currentPage * tableState.pageSize
    );

    const handleSort = (column: string) => {
      if (tableState.sortColumn === column) {
        updateTableState({
          sortDirection: tableState.sortDirection === 'asc' ? 'desc' : 'asc',
        });
      } else {
        updateTableState({
          sortColumn: column,
          sortDirection: 'asc',
        });
      }
    };

    const exportTable = (format: 'csv' | 'json') => {
      try {
        let exportData: string;
        
        if (format === 'csv') {
          const csvRows = [
            table.headers.join(','),
            ...processedData.map(row => row.map(cell => `"${cell}"`).join(','))
          ];
          exportData = csvRows.join('\n');
        } else {
          const jsonData = processedData.map(row => {
            const obj: Record<string, string> = {};
            table.headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          exportData = JSON.stringify(jsonData, null, 2);
        }

        const blob = new Blob([exportData], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table-${table.id}.${format}`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: 'Export Successful',
          description: `Table exported as ${format.toUpperCase()}`,
        });
      } catch (error) {
        toast({
          title: 'Export Failed',
          description: 'Failed to export table data',
          variant: 'destructive',
        });
      }
    };

    return (
      <Card className="my-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Data Table ({processedData.length} rows)
            </CardTitle>
            <div className="flex items-center gap-2">
              {table.metadata?.filterable && (
                <Input
                  placeholder="Filter table..."
                  value={tableState.filterText}
                  onChange={(e) => updateTableState({ filterText: e.target.value, currentPage: 1 })}
                  className="w-40 h-8"
                />
              )}
              {table.metadata?.exportable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportTable('csv')}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportTable('json')}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {table.headers.map((header, index) => (
                    <TableHead
                      key={index}
                      className={table.metadata?.sortable ? 'cursor-pointer select-none' : ''}
                      onClick={() => table.metadata?.sortable && handleSort(header)}
                    >
                      <div className="flex items-center gap-1">
                        {header}
                        {table.metadata?.sortable && tableState.sortColumn === header && (
                          tableState.sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {table.metadata?.pagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(tableState.currentPage - 1) * tableState.pageSize + 1} to{' '}
                {Math.min(tableState.currentPage * tableState.pageSize, processedData.length)} of{' '}
                {processedData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTableState({ currentPage: tableState.currentPage - 1 })}
                  disabled={tableState.currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {tableState.currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTableState({ currentPage: tableState.currentPage + 1 })}
                  disabled={tableState.currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Table of Contents component
  const TableOfContents = ({ toc }: { toc: MarkdownContent['toc'] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {toc.map((item, index) => (
            <a
              key={index}
              href={`#${item.id}`}
              className={`block text-sm hover:text-primary transition-colors ${
                item.level === 1 ? 'font-medium' : 
                item.level === 2 ? 'ml-4' : 
                item.level === 3 ? 'ml-8' : 'ml-12'
              }`}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );

  // Metadata component
  const MetadataPanel = ({ metadata }: { metadata: MarkdownContent['metadata'] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Document Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {metadata.title && (
          <div>
            <span className="text-sm font-medium">Title:</span>
            <span className="text-sm ml-2">{metadata.title}</span>
          </div>
        )}
        {metadata.description && (
          <div>
            <span className="text-sm font-medium">Description:</span>
            <span className="text-sm ml-2">{metadata.description}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {metadata.wordCount} words
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metadata.readingTime} min read
          </div>
        </div>
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {metadata.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Parsing markdown...</p>
        </div>
      </div>
    );
  }

  if (!parsedContent) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No content to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`markdown-viewer ${className}`}>
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'rendered' | 'source')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="rendered" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Rendered
            </TabsTrigger>
            <TabsTrigger value="source" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Source
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rendered" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              {/* Main content */}
              <Card>
                <CardContent className="p-6">
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: parsedContent.html }}
                  />
                </CardContent>
              </Card>

              {/* Enhanced tables */}
              {enableTableFeatures && parsedContent.tables.map((table) => (
                <EnhancedTable key={table.id} table={table} />
              ))}
            </div>

            <div className="space-y-4">
              {/* Metadata */}
              {showMetadata && <MetadataPanel metadata={parsedContent.metadata} />}
              
              {/* Table of Contents */}
              {showTOC && parsedContent.toc.length > 0 && (
                <TableOfContents toc={parsedContent.toc} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="source">
          <Card>
            <CardContent className="p-0">
              <pre className="p-6 text-sm overflow-auto bg-muted/30 rounded-lg">
                <code>{content}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom styles for markdown content */}
      <style>{`
        .markdown-viewer .prose {
          color: inherit;
        }
        .markdown-viewer .prose h1,
        .markdown-viewer .prose h2,
        .markdown-viewer .prose h3,
        .markdown-viewer .prose h4,
        .markdown-viewer .prose h5,
        .markdown-viewer .prose h6 {
          color: inherit;
          font-weight: 600;
        }
        .markdown-viewer .prose code {
          background-color: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .markdown-viewer .prose pre {
          background-color: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
        }
        .markdown-viewer .prose blockquote {
          border-left: 4px solid hsl(var(--primary));
          background-color: hsl(var(--muted) / 0.3);
          padding: 1rem;
          margin: 1rem 0;
        }
        .markdown-table-container {
          margin: 1rem 0;
        }
        .markdown-table {
          width: 100%;
          border-collapse: collapse;
        }
        .markdown-table th,
        .markdown-table td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-table th {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default MarkdownViewer;