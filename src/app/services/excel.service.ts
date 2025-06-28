import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import {ExcelData} from '../interfaces/candidate.interface';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  /**
   * Validate Excel file before upload
   */
  validateExcelFile(file: File): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      if (!this.isExcelFile(file)) {
        reject(new Error('Please select a valid Excel file (.xlsx or .xls)'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          // Read the workbook
          const workbook = XLSX.read(data, {type: 'array'});

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            reject(new Error('Excel file must contain at least one sheet'));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log('Parsed Excel data:', jsonData);

          // Validate data structure
          const validatedData = this.validateExcelData(jsonData);
          resolve(validatedData);
        } catch (error) {
          console.error('Excel parsing error:', error);
          reject(new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      // Use ArrayBuffer instead of binary string
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Check if file is a valid Excel file
   */
  private isExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const validExtensions = ['.xlsx', '.xls'];

    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    return hasValidType || hasValidExtension;
  }

  /**
   * Validate Excel data structure
   */
  private validateExcelData(jsonData: any[]): ExcelData {
    console.log('Validating Excel data:', jsonData);

    if (!Array.isArray(jsonData)) {
      throw new Error('Invalid Excel data format');
    }

    if (jsonData.length === 0) {
      throw new Error('Excel file must contain data rows');
    }

    if (jsonData.length > 1) {
      throw new Error('Excel file must contain exactly one data row');
    }

    const row = jsonData[0];
    console.log('Processing row:', row);

    if (!row || typeof row !== 'object') {
      throw new Error('Invalid data row format');
    }

    const normalizedRow = this.normalizeKeys(row);
    console.log('Normalized row:', normalizedRow);

    // Check required columns
    const requiredColumns = ['seniority', 'years', 'availability'];
    const missingColumns = requiredColumns.filter(col => {
      const hasColumn = col in normalizedRow;
      console.log(`Column '${col}' exists:`, hasColumn);
      return !hasColumn;
    });

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    try {
      const result = {
        seniority: this.validateSeniority(normalizedRow.seniority),
        years: this.validateYears(normalizedRow.years),
        availability: this.validateAvailability(normalizedRow.availability),
      };

      console.log('Validation result:', result);
      return result;
    } catch (validationError) {
      console.error('Data validation error:', validationError);
      throw validationError;
    }
  }

  /**
   * Normalize object keys to lowercase
   */
  private normalizeKeys(obj: any): any {
    const normalized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key) {
        const normalizedKey = key.toString().toLowerCase().trim();
        normalized[normalizedKey] = obj[key];
      }
    }
    return normalized;
  }

  /**
   * Validate seniority value
   */
  private validateSeniority(value: any): 'junior' | 'senior' {
    if (value === null || value === undefined || value === '') {
      throw new Error('Seniority is required');
    }

    const seniority = String(value).toLowerCase().trim();
    if (seniority !== 'junior' && seniority !== 'senior') {
      throw new Error('Seniority must be either "junior" or "senior"');
    }
    return seniority as 'junior' | 'senior';
  }

  /**
   * Validate years value
   */
  private validateYears(value: any): number {
    if (value === null || value === undefined || value === '') {
      throw new Error('Years is required');
    }

    const years = Number(value);
    if (isNaN(years) || years < 0 || years > 50) {
      throw new Error('Years must be a number between 0 and 50');
    }
    return Math.floor(years);
  }

  /**
   * Validate availability value
   */
  private validateAvailability(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      throw new Error('Availability is required');
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const strValue = String(value).toLowerCase().trim();
    if (strValue === 'true' || strValue === '1' || strValue === 'yes') {
      return true;
    }
    if (strValue === 'false' || strValue === '0' || strValue === 'no') {
      return false;
    }

    throw new Error('Availability must be a boolean value (true/false, 1/0, yes/no)');
  }


  // Add to excel.service.ts for debugging
  debugExcelFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, {type: 'array'});

          console.log('Workbook sheets:', workbook.SheetNames);

          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          console.log('Worksheet:', worksheet);

          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('JSON data:', jsonData);

          const jsonDataWithHeaders = XLSX.utils.sheet_to_json(worksheet, {header: 1});
          console.log('Raw data with headers:', jsonDataWithHeaders);

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
