import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export class DataProvider {
  static readJson<T = unknown>(filePath: string): T {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as T;
  }

  static readCsv<T extends Record<string, string> = Record<string, string>>(filePath: string): T[] {
    const fileContents = fs.readFileSync(filePath);
    return parse(fileContents, {
      columns: true,
      skip_empty_lines: true,
    }) as T[];
  }

  static readExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }
}
