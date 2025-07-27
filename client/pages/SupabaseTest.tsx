import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Database, CheckCircle, XCircle, Eye } from 'lucide-react';
import { runDatabaseInspection, testTableAccess } from '../../shared/supabase';

interface DatabaseSchema {
  [tableName: string]: {
    columns: Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>;
    sampleData: any[];
    rowCount: number;
  };
}

export default function SupabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inspectDatabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting database inspection...');
      const result = await runDatabaseInspection();
      
      if (result) {
        setConnectionStatus('connected');
        setSchema(result.schema);
        setTableNames(result.tableNames);
        console.log('✅ Database inspection completed successfully');
      } else {
        setConnectionStatus('error');
        setError('Failed to connect to database. Please check your Supabase credentials in .env file.');
      }
    } catch (err) {
      console.error('❌ Database inspection failed:', err);
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const viewTableData = async (tableName: string) => {
    setSelectedTable(tableName);
    setTableData(null);
    
    try {
      const data = await testTableAccess(tableName, 5);
      setTableData(data);
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setTableData([]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Supabase Database Inspector</h1>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Test connection to your Supabase database and inspect the schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={inspectDatabase} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isLoading ? 'Inspecting...' : 'Inspect Database'}
            </Button>
            
            {connectionStatus !== 'idle' && (
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600">Connection Failed</span>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Schema */}
      {schema && (
        <Card>
          <CardHeader>
            <CardTitle>Database Schema</CardTitle>
            <CardDescription>
              Found {tableNames.length} tables in your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tableNames.map((tableName) => {
                const tableInfo = schema[tableName];
                return (
                  <Card key={tableName} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tableName}</CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewTableData(tableName)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {tableInfo.columns.length} columns
                          </Badge>
                          <Badge variant="outline">
                            {tableInfo.rowCount} sample rows
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Columns:</strong>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tableInfo.columns.slice(0, 5).map((col) => (
                              <Badge key={col.column_name} variant="outline" className="text-xs">
                                {col.column_name}
                              </Badge>
                            ))}
                            {tableInfo.columns.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{tableInfo.columns.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Data Viewer */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Table Data: {selectedTable}</CardTitle>
            <CardDescription>
              Sample data from the {selectedTable} table
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tableData === null ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading data...</span>
              </div>
            ) : tableData.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No data found in this table or access denied.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Showing {tableData.length} records
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-sm">
                              {value === null ? (
                                <span className="text-gray-400 italic">null</span>
                              ) : typeof value === 'object' ? (
                                <span className="text-blue-600">
                                  {JSON.stringify(value)}
                                </span>
                              ) : (
                                String(value)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Make sure to add your Supabase anon key to the .env file
          </p>
          <p className="text-sm text-muted-foreground">
            2. Click "Inspect Database" to connect and view your tables
          </p>
          <p className="text-sm text-muted-foreground">
            3. Click "View" on any table to see sample data
          </p>
          <p className="text-sm text-muted-foreground">
            4. Check the browser console for detailed logs
          </p>
        </CardContent>
      </Card>
    </div>
  );
}