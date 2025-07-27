import React, { useState, useEffect } from 'react';
import { useReporting } from '../../hooks/use-reporting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { 
  AlertTriangle, 
  Download, 
  Filter, 
  Search, 
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import type { AssetDowntimeReport as AssetReport } from '../../../shared/reporting-types';

interface AssetDowntimeReportProps {
  onClose?: () => void;
}

export default function AssetDowntimeReport({ onClose }: AssetDowntimeReportProps) {
  const {
    assetDowntimeReports,
    isLoading,
    error,
    generateReport,
    exportReport
  } = useReporting();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('totalDowntimeHours');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  // Generate report on component mount
  useEffect(() => {
    generateReport('asset_downtime');
  }, [generateReport]);

  // Filter and sort reports
  const filteredReports = assetDowntimeReports
    .filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.systemName.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesAvailability = true;
      if (availabilityFilter === 'high') {
        matchesAvailability = report.availability >= 95;
      } else if (availabilityFilter === 'medium') {
        matchesAvailability = report.availability >= 85 && report.availability < 95;
      } else if (availabilityFilter === 'low') {
        matchesAvailability = report.availability < 85;
      }
      
      return matchesSearch && matchesAvailability;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof AssetReport];
      const bValue = b[sortBy as keyof AssetReport];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate summary statistics
  const totalAssets = assetDowntimeReports.length;
  const avgAvailability = totalAssets > 0 
    ? assetDowntimeReports.reduce((sum, r) => sum + r.availability, 0) / totalAssets 
    : 0;
  const avgMTBF = totalAssets > 0
    ? assetDowntimeReports.reduce((sum, r) => sum + r.mtbf, 0) / totalAssets
    : 0;
  const avgMTTR = totalAssets > 0
    ? assetDowntimeReports.reduce((sum, r) => sum + r.mttr, 0) / totalAssets
    : 0;
  const criticalAssets = assetDowntimeReports.filter(r => r.availability < 85).length;

  const getAvailabilityBadge = (availability: number) => {
    if (availability >= 95) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (availability >= 90) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (availability >= 85) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    } else {
      return <Badge variant="destructive">Poor</Badge>;
    }
  };

  const getReliabilityBadge = (reliability: number) => {
    if (reliability >= 95) {
      return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
    } else if (reliability >= 85) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Medium</Badge>;
    } else {
      return <Badge variant="destructive">Low</Badge>;
    }
  };

  const handleExport = () => {
    exportReport('asset_downtime', {
      format: 'excel',
      includeCharts: false,
      includeFilters: true,
      title: 'Asset Downtime Analysis Report'
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Report</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => generateReport('asset_downtime')}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Asset Downtime Analysis
          </h2>
          <p className="text-muted-foreground">
            Track asset availability, MTBF, MTTR, and downtime patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{totalAssets}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Availability</p>
                <p className="text-2xl font-bold text-green-600">{avgAvailability.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg MTBF</p>
                <p className="text-2xl font-bold">{avgMTBF.toFixed(0)}h</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Assets</p>
                <p className="text-2xl font-bold text-red-600">{criticalAssets}</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mean Time Between Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{avgMTBF.toFixed(0)}</div>
            <p className="text-sm text-muted-foreground">hours average</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mean Time To Repair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{avgMTTR.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">hours average</p>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">-8.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgAvailability.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">fleet average</p>
            <Progress value={avgAvailability} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="high">High (≥95%)</SelectItem>
                <SelectItem value="medium">Medium (85-94%)</SelectItem>
                <SelectItem value="low">Low (&lt;85%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalDowntimeHours">Total Downtime</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="reliability">Reliability</SelectItem>
                <SelectItem value="mtbf">MTBF</SelectItem>
                <SelectItem value="mttr">MTTR</SelectItem>
                <SelectItem value="criticalFailures">Critical Failures</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Highest First</SelectItem>
                <SelectItem value="asc">Lowest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Downtime Details ({filteredReports.length})</CardTitle>
          <CardDescription>
            Showing {filteredReports.length} of {totalAssets} assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading asset data...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Total Downtime</TableHead>
                    <TableHead>Planned/Unplanned</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Reliability</TableHead>
                    <TableHead>MTBF</TableHead>
                    <TableHead>MTTR</TableHead>
                    <TableHead>Critical Failures</TableHead>
                    <TableHead>Last Failure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.assetId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.assetName}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.serialNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{report.systemName}</div>
                          <div className="text-muted-foreground">{report.locationName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{report.totalDowntimeHours.toFixed(1)}h</div>
                          <div className="text-muted-foreground">
                            {report.downtimeEvents} events
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-blue-600">
                            Planned: {report.plannedDowntimeHours.toFixed(1)}h
                          </div>
                          <div className="text-red-600">
                            Unplanned: {report.unplannedDowntimeHours.toFixed(1)}h
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {report.availability.toFixed(1)}%
                          </div>
                          {getAvailabilityBadge(report.availability)}
                        </div>
                        <Progress value={report.availability} className="w-16 h-1 mt-1" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {report.reliability.toFixed(1)}%
                          </div>
                          {getReliabilityBadge(report.reliability)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {report.mtbf.toFixed(0)}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {report.mttr.toFixed(1)}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {report.criticalFailures > 0 ? (
                            <Badge variant="destructive">
                              {report.criticalFailures}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">0</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.lastFailureDate 
                            ? new Date(report.lastFailureDate).toLocaleDateString()
                            : 'None'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}