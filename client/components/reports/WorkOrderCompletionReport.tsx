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
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import type { WorkOrderCompletionReport as WorkOrderReport, ReportFilter } from '../../../shared/reporting-types';

interface WorkOrderCompletionReportProps {
  onClose?: () => void;
}

export default function WorkOrderCompletionReport({ onClose }: WorkOrderCompletionReportProps) {
  const {
    workOrderReports,
    isLoading,
    error,
    generateReport,
    exportReport,
    currentFilters,
    updateFilters
  } = useReporting();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Generate report on component mount
  useEffect(() => {
    generateReport('work_order_completion');
  }, [generateReport]);

  // Filter and sort reports
  const filteredReports = workOrderReports
    .filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.assetName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof WorkOrderReport];
      const bValue = b[sortBy as keyof WorkOrderReport];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate summary statistics
  const totalReports = workOrderReports.length;
  const completedReports = workOrderReports.filter(r => r.status === 'completed').length;
  const overdueReports = workOrderReports.filter(r => r.overdue).length;
  const avgCompletionRate = totalReports > 0 
    ? workOrderReports.reduce((sum, r) => sum + r.completionRate, 0) / totalReports 
    : 0;
  const avgActualHours = totalReports > 0
    ? workOrderReports.reduce((sum, r) => sum + r.actualHours, 0) / totalReports
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleExport = () => {
    exportReport('work_order_completion', {
      format: 'excel',
      includeCharts: false,
      includeFilters: true,
      title: 'Work Order Completion Report'
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
            <Button onClick={() => generateReport('work_order_completion')}>
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
            <FileText className="h-6 w-6" />
            Work Order Completion Report
          </h2>
          <p className="text-muted-foreground">
            Detailed analysis of work order completion rates and performance
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
                <p className="text-sm font-medium text-muted-foreground">Total Work Orders</p>
                <p className="text-2xl font-bold">{totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedReports}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueReports}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</p>
              </div>
              <Progress value={avgCompletionRate} className="w-8 h-8" />
            </div>
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
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="completedAt">Completed Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="actualHours">Actual Hours</SelectItem>
                <SelectItem value="totalCost">Total Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders ({filteredReports.length})</CardTitle>
          <CardDescription>
            Showing {filteredReports.length} of {totalReports} work orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading work orders...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No work orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.workOrderNumber}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-32">
                            {report.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{report.assetName}</div>
                          <div className="text-muted-foreground">{report.systemName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>{report.assignedTo}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.completedAt 
                            ? new Date(report.completedAt).toLocaleDateString()
                            : '-'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{report.actualHours.toFixed(1)}h</div>
                          <div className="text-muted-foreground">
                            Est: {report.estimatedHours.toFixed(1)}h
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          ฿{report.totalCost.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={report.completionRate} className="w-16 h-2" />
                          <span className="text-sm">{report.completionRate.toFixed(0)}%</span>
                        </div>
                        {report.overdue && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <Clock className="h-3 w-3" />
                            Overdue
                          </div>
                        )}
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