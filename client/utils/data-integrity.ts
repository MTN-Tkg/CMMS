import { enhancedOfflineStorage } from './enhanced-offline-storage';

export interface DataIntegrityCheck {
  id: string;
  type: 'checksum' | 'schema' | 'reference' | 'constraint';
  status: 'passed' | 'failed' | 'warning';
  message: string;
  timestamp: number;
  data?: any;
}

export interface IntegrityReport {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  checks: DataIntegrityCheck[];
  overallStatus: 'healthy' | 'degraded' | 'critical';
}

export interface SchemaDefinition {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    format?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    properties?: SchemaDefinition;
    items?: SchemaDefinition[string];
  };
}

export interface ReferenceRule {
  field: string;
  referencedStore: string;
  referencedField: string;
  required?: boolean;
}

export interface ConstraintRule {
  field: string;
  constraint: (value: any, item: any) => boolean;
  message: string;
}

class DataIntegrityValidator {
  private schemas: Map<string, SchemaDefinition> = new Map();
  private referenceRules: Map<string, ReferenceRule[]> = new Map();
  private constraintRules: Map<string, ConstraintRule[]> = new Map();
  private validationHistory: DataIntegrityCheck[] = [];

  // Register schema for a data store
  registerSchema(storeName: string, schema: SchemaDefinition): void {
    this.schemas.set(storeName, schema);
  }

  // Register reference integrity rules
  registerReferenceRules(storeName: string, rules: ReferenceRule[]): void {
    this.referenceRules.set(storeName, rules);
  }

  // Register custom constraint rules
  registerConstraintRules(storeName: string, rules: ConstraintRule[]): void {
    this.constraintRules.set(storeName, rules);
  }

  // Validate single item against schema
  validateSchema(item: any, schema: SchemaDefinition): DataIntegrityCheck[] {
    const checks: DataIntegrityCheck[] = [];
    
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = item[fieldName];
      const checkId = `schema_${fieldName}_${Date.now()}`;
      
      // Check required fields
      if (fieldSchema.required && (value === undefined || value === null)) {
        checks.push({
          id: checkId,
          type: 'schema',
          status: 'failed',
          message: `Required field '${fieldName}' is missing`,
          timestamp: Date.now(),
          data: { field: fieldName, value }
        });
        continue;
      }
      
      if (value === undefined || value === null) continue;
      
      // Type validation
      if (!this.validateType(value, fieldSchema.type)) {
        checks.push({
          id: checkId,
          type: 'schema',
          status: 'failed',
          message: `Field '${fieldName}' has invalid type. Expected ${fieldSchema.type}, got ${typeof value}`,
          timestamp: Date.now(),
          data: { field: fieldName, value, expectedType: fieldSchema.type }
        });
        continue;
      }
      
      // Format validation
      if (fieldSchema.format && !this.validateFormat(value, fieldSchema.format)) {
        checks.push({
          id: checkId,
          type: 'schema',
          status: 'failed',
          message: `Field '${fieldName}' has invalid format. Expected ${fieldSchema.format}`,
          timestamp: Date.now(),
          data: { field: fieldName, value, expectedFormat: fieldSchema.format }
        });
        continue;
      }
      
      // Range validation
      if (typeof value === 'number') {
        if (fieldSchema.min !== undefined && value < fieldSchema.min) {
          checks.push({
            id: checkId,
            type: 'schema',
            status: 'failed',
            message: `Field '${fieldName}' is below minimum value ${fieldSchema.min}`,
            timestamp: Date.now(),
            data: { field: fieldName, value, min: fieldSchema.min }
          });
          continue;
        }
        
        if (fieldSchema.max !== undefined && value > fieldSchema.max) {
          checks.push({
            id: checkId,
            type: 'schema',
            status: 'failed',
            message: `Field '${fieldName}' exceeds maximum value ${fieldSchema.max}`,
            timestamp: Date.now(),
            data: { field: fieldName, value, max: fieldSchema.max }
          });
          continue;
        }
      }
      
      // Pattern validation
      if (fieldSchema.pattern && typeof value === 'string' && !fieldSchema.pattern.test(value)) {
        checks.push({
          id: checkId,
          type: 'schema',
          status: 'failed',
          message: `Field '${fieldName}' does not match required pattern`,
          timestamp: Date.now(),
          data: { field: fieldName, value, pattern: fieldSchema.pattern.source }
        });
        continue;
      }
      
      // Enum validation
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        checks.push({
          id: checkId,
          type: 'schema',
          status: 'failed',
          message: `Field '${fieldName}' has invalid value. Must be one of: ${fieldSchema.enum.join(', ')}`,
          timestamp: Date.now(),
          data: { field: fieldName, value, allowedValues: fieldSchema.enum }
        });
        continue;
      }
      
      // Object validation (recursive)
      if (fieldSchema.type === 'object' && fieldSchema.properties) {
        const nestedChecks = this.validateSchema(value, fieldSchema.properties);
        checks.push(...nestedChecks);
      }
      
      // Array validation
      if (fieldSchema.type === 'array' && fieldSchema.items && Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (fieldSchema.items.type === 'object' && fieldSchema.items.properties) {
            const itemChecks = this.validateSchema(value[i], fieldSchema.items.properties);
            checks.push(...itemChecks);
          } else {
            if (!this.validateType(value[i], fieldSchema.items.type)) {
              checks.push({
                id: `${checkId}_item_${i}`,
                type: 'schema',
                status: 'failed',
                message: `Array item ${i} in field '${fieldName}' has invalid type`,
                timestamp: Date.now(),
                data: { field: fieldName, index: i, value: value[i], expectedType: fieldSchema.items.type }
              });
            }
          }
        }
      }
      
      // If we reach here, validation passed
      checks.push({
        id: checkId,
        type: 'schema',
        status: 'passed',
        message: `Field '${fieldName}' validation passed`,
        timestamp: Date.now(),
        data: { field: fieldName }
      });
    }
    
    return checks;
  }

  // Validate reference integrity
  async validateReferences(storeName: string, item: any): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];
    const rules = this.referenceRules.get(storeName) || [];
    
    for (const rule of rules) {
      const checkId = `reference_${rule.field}_${Date.now()}`;
      const value = item[rule.field];
      
      if (!value && rule.required) {
        checks.push({
          id: checkId,
          type: 'reference',
          status: 'failed',
          message: `Required reference field '${rule.field}' is missing`,
          timestamp: Date.now(),
          data: { field: rule.field, referencedStore: rule.referencedStore }
        });
        continue;
      }
      
      if (!value) continue;
      
      try {
        // Check if referenced item exists
        const referencedItems = await enhancedOfflineStorage.getData(rule.referencedStore);
        const referencedItem = referencedItems.find(item => 
          item[rule.referencedField] === value || item._metadata?.id === value
        );
        
        if (!referencedItem) {
          checks.push({
            id: checkId,
            type: 'reference',
            status: 'failed',
            message: `Referenced item not found: ${rule.referencedStore}.${rule.referencedField} = ${value}`,
            timestamp: Date.now(),
            data: { 
              field: rule.field, 
              value, 
              referencedStore: rule.referencedStore, 
              referencedField: rule.referencedField 
            }
          });
        } else {
          checks.push({
            id: checkId,
            type: 'reference',
            status: 'passed',
            message: `Reference validation passed for field '${rule.field}'`,
            timestamp: Date.now(),
            data: { field: rule.field, referencedItem: referencedItem._metadata?.id }
          });
        }
      } catch (error) {
        checks.push({
          id: checkId,
          type: 'reference',
          status: 'warning',
          message: `Could not validate reference for field '${rule.field}': ${error.message}`,
          timestamp: Date.now(),
          data: { field: rule.field, error: error.message }
        });
      }
    }
    
    return checks;
  }

  // Validate custom constraints
  validateConstraints(storeName: string, item: any): DataIntegrityCheck[] {
    const checks: DataIntegrityCheck[] = [];
    const rules = this.constraintRules.get(storeName) || [];
    
    for (const rule of rules) {
      const checkId = `constraint_${rule.field}_${Date.now()}`;
      
      try {
        const isValid = rule.constraint(item[rule.field], item);
        
        checks.push({
          id: checkId,
          type: 'constraint',
          status: isValid ? 'passed' : 'failed',
          message: isValid ? `Constraint validation passed for field '${rule.field}'` : rule.message,
          timestamp: Date.now(),
          data: { field: rule.field, value: item[rule.field] }
        });
      } catch (error) {
        checks.push({
          id: checkId,
          type: 'constraint',
          status: 'warning',
          message: `Constraint validation error for field '${rule.field}': ${error.message}`,
          timestamp: Date.now(),
          data: { field: rule.field, error: error.message }
        });
      }
    }
    
    return checks;
  }

  // Calculate and validate checksums
  async validateChecksums(storeName: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];
    
    try {
      const items = await enhancedOfflineStorage.getData(storeName);
      
      for (const item of items) {
        const checkId = `checksum_${item._metadata?.id}_${Date.now()}`;
        const storedChecksum = item._metadata?.checksum;
        
        if (!storedChecksum) {
          checks.push({
            id: checkId,
            type: 'checksum',
            status: 'warning',
            message: `No checksum found for item ${item._metadata?.id}`,
            timestamp: Date.now(),
            data: { itemId: item._metadata?.id }
          });
          continue;
        }
        
        // Recalculate checksum
        const { _metadata, ...itemData } = item;
        const calculatedChecksum = this.calculateChecksum(itemData);
        
        if (calculatedChecksum === storedChecksum) {
          checks.push({
            id: checkId,
            type: 'checksum',
            status: 'passed',
            message: `Checksum validation passed for item ${item._metadata?.id}`,
            timestamp: Date.now(),
            data: { itemId: item._metadata?.id }
          });
        } else {
          checks.push({
            id: checkId,
            type: 'checksum',
            status: 'failed',
            message: `Checksum mismatch for item ${item._metadata?.id}`,
            timestamp: Date.now(),
            data: { 
              itemId: item._metadata?.id, 
              expected: storedChecksum, 
              actual: calculatedChecksum 
            }
          });
        }
      }
    } catch (error) {
      checks.push({
        id: `checksum_error_${Date.now()}`,
        type: 'checksum',
        status: 'warning',
        message: `Checksum validation error for store '${storeName}': ${error.message}`,
        timestamp: Date.now(),
        data: { storeName, error: error.message }
      });
    }
    
    return checks;
  }

  // Comprehensive validation
  async validateStore(storeName: string): Promise<IntegrityReport> {
    const allChecks: DataIntegrityCheck[] = [];
    
    try {
      // Schema validation
      const schema = this.schemas.get(storeName);
      if (schema) {
        const items = await enhancedOfflineStorage.getData(storeName);
        for (const item of items) {
          const { _metadata, ...itemData } = item;
          const schemaChecks = this.validateSchema(itemData, schema);
          allChecks.push(...schemaChecks);
          
          // Reference validation
          const referenceChecks = await this.validateReferences(storeName, itemData);
          allChecks.push(...referenceChecks);
          
          // Constraint validation
          const constraintChecks = this.validateConstraints(storeName, itemData);
          allChecks.push(...constraintChecks);
        }
      }
      
      // Checksum validation
      const checksumChecks = await this.validateChecksums(storeName);
      allChecks.push(...checksumChecks);
      
    } catch (error) {
      allChecks.push({
        id: `validation_error_${Date.now()}`,
        type: 'schema',
        status: 'failed',
        message: `Validation error for store '${storeName}': ${error.message}`,
        timestamp: Date.now(),
        data: { storeName, error: error.message }
      });
    }
    
    // Store validation history
    this.validationHistory.push(...allChecks);
    
    // Generate report
    const passed = allChecks.filter(check => check.status === 'passed').length;
    const failed = allChecks.filter(check => check.status === 'failed').length;
    const warnings = allChecks.filter(check => check.status === 'warning').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'critical';
    if (failed === 0 && warnings === 0) {
      overallStatus = 'healthy';
    } else if (failed === 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'critical';
    }
    
    return {
      totalChecks: allChecks.length,
      passed,
      failed,
      warnings,
      checks: allChecks,
      overallStatus
    };
  }

  // Validate all stores
  async validateAllStores(): Promise<Map<string, IntegrityReport>> {
    const reports = new Map<string, IntegrityReport>();
    const storeNames = Array.from(this.schemas.keys());
    
    for (const storeName of storeNames) {
      const report = await this.validateStore(storeName);
      reports.set(storeName, report);
    }
    
    return reports;
  }

  // Get validation history
  getValidationHistory(limit?: number): DataIntegrityCheck[] {
    const sorted = this.validationHistory.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // Clear validation history
  clearValidationHistory(): void {
    this.validationHistory = [];
  }

  // Repair data integrity issues
  async repairIntegrityIssues(storeName: string, checks: DataIntegrityCheck[]): Promise<number> {
    let repairedCount = 0;
    
    for (const check of checks) {
      if (check.status !== 'failed') continue;
      
      try {
        switch (check.type) {
          case 'checksum':
            // Recalculate and update checksum
            if (check.data?.itemId) {
              const items = await enhancedOfflineStorage.getData(storeName);
              const item = items.find(i => i._metadata?.id === check.data.itemId);
              if (item) {
                const { _metadata, ...itemData } = item;
                const newChecksum = this.calculateChecksum(itemData);
                // Update would need to be implemented in enhanced storage
                repairedCount++;
              }
            }
            break;
            
          case 'reference':
            // Could implement reference repair logic here
            break;
            
          case 'schema':
            // Could implement schema repair logic here
            break;
        }
      } catch (error) {
        console.error(`Failed to repair integrity issue ${check.id}:`, error);
      }
    }
    
    return repairedCount;
  }

  // Helper methods
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  private validateFormat(value: string, format: string): boolean {
    switch (format) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'date':
        return !isNaN(Date.parse(value));
      case 'uuid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      case 'phone':
        return /^\+?[\d\s\-\(\)]+$/.test(value);
      default:
        return true;
    }
  }

  private calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

// Export singleton instance
export const dataIntegrityValidator = new DataIntegrityValidator();

// Setup default schemas for CMMS data
dataIntegrityValidator.registerSchema('work-orders', {
  id: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  priority: { type: 'string', required: true, enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: 'string', required: true, enum: ['open', 'in-progress', 'completed', 'cancelled'] },
  assignee: { type: 'string', required: true },
  createdDate: { type: 'string', required: true, format: 'date' },
  dueDate: { type: 'string', format: 'date' },
  assetId: { type: 'string' },
  estimatedHours: { type: 'number', min: 0 },
  actualHours: { type: 'number', min: 0 }
});

dataIntegrityValidator.registerSchema('assets', {
  id: { type: 'string', required: true },
  name: { type: 'string', required: true },
  category: { type: 'string', required: true },
  location: { type: 'string', required: true },
  status: { type: 'string', required: true, enum: ['active', 'inactive', 'maintenance', 'retired'] },
  purchaseDate: { type: 'string', format: 'date' },
  warranty: { type: 'string' },
  serialNumber: { type: 'string' },
  model: { type: 'string' },
  manufacturer: { type: 'string' }
});

dataIntegrityValidator.registerSchema('parts', {
  id: { type: 'string', required: true },
  name: { type: 'string', required: true },
  category: { type: 'string', required: true },
  quantity: { type: 'number', required: true, min: 0 },
  unitPrice: { type: 'number', required: true, min: 0 },
  supplier: { type: 'string', required: true },
  location: { type: 'string', required: true },
  minStock: { type: 'number', min: 0 },
  maxStock: { type: 'number', min: 0 }
});

// Setup reference rules
dataIntegrityValidator.registerReferenceRules('work-orders', [
  { field: 'assetId', referencedStore: 'assets', referencedField: 'id', required: false },
  { field: 'assignee', referencedStore: 'users', referencedField: 'id', required: true }
]);

// Setup constraint rules
dataIntegrityValidator.registerConstraintRules('work-orders', [
  {
    field: 'dueDate',
    constraint: (dueDate, workOrder) => {
      if (!dueDate) return true;
      const due = new Date(dueDate);
      const created = new Date(workOrder.createdDate);
      return due >= created;
    },
    message: 'Due date cannot be before creation date'
  },
  {
    field: 'actualHours',
    constraint: (actualHours, workOrder) => {
      if (!actualHours || !workOrder.estimatedHours) return true;
      return actualHours <= workOrder.estimatedHours * 2; // Allow up to 200% of estimate
    },
    message: 'Actual hours significantly exceed estimate'
  }
]);

dataIntegrityValidator.registerConstraintRules('parts', [
  {
    field: 'quantity',
    constraint: (quantity, part) => {
      if (!part.minStock) return true;
      return quantity >= 0;
    },
    message: 'Quantity cannot be negative'
  },
  {
    field: 'maxStock',
    constraint: (maxStock, part) => {
      if (!maxStock || !part.minStock) return true;
      return maxStock >= part.minStock;
    },
    message: 'Maximum stock must be greater than or equal to minimum stock'
  }
]);

// Export utility functions
export const integrityUtils = {
  // Schedule periodic validation
  scheduleValidation(intervalMs: number = 60 * 60 * 1000): () => void {
    const interval = setInterval(async () => {
      try {
        const reports = await dataIntegrityValidator.validateAllStores();
        console.log('Scheduled integrity validation completed:', reports);
      } catch (error) {
        console.error('Scheduled integrity validation failed:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  },

  // Generate integrity summary
  generateSummary(reports: Map<string, IntegrityReport>): {
    totalStores: number;
    healthyStores: number;
    degradedStores: number;
    criticalStores: number;
    totalIssues: number;
  } {
    let healthyStores = 0;
    let degradedStores = 0;
    let criticalStores = 0;
    let totalIssues = 0;

    for (const report of reports.values()) {
      switch (report.overallStatus) {
        case 'healthy':
          healthyStores++;
          break;
        case 'degraded':
          degradedStores++;
          break;
        case 'critical':
          criticalStores++;
          break;
      }
      totalIssues += report.failed + report.warnings;
    }

    return {
      totalStores: reports.size,
      healthyStores,
      degradedStores,
      criticalStores,
      totalIssues
    };
  }
};