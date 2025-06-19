import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import Papa from 'papaparse';
import { ContentItem, TableData } from '@/types/common';

export class ContentService {
  private contentRoot: string;

  constructor(contentRoot: string) {
    this.contentRoot = contentRoot;
  }

  setContentRoot(newRoot: string): void {
    this.contentRoot = newRoot;
  }

  getContentRoot(): string {
    return this.contentRoot;
  }

  async listContentTypes(): Promise<string[]> {
    try {
      await this.ensureContentRoot();
      const items = fs.readdirSync(this.contentRoot, { withFileTypes: true });
      return items
        .filter((item) => item.isDirectory())
        .map((item) => item.name)
        .sort();
    } catch (error) {
      console.error('Failed to list content types:', error);
      return [];
    }
  }

  private getItemDir(type: string, id: string): string {
    return path.join(this.contentRoot, type, id);
  }

  listItems(type: string): ContentItem[] {
    const typeDir = path.join(this.contentRoot, type);
    if (!fs.existsSync(typeDir)) {
      return [];
    }

    const items = fs.readdirSync(typeDir, { withFileTypes: true });
    return items
      .filter((item) => item.isDirectory())
      .map((item) => {
        const articlePath = path.join(typeDir, item.name, 'article.md');
        let title = item.name;

        if (fs.existsSync(articlePath)) {
          try {
            const content = fs.readFileSync(articlePath, 'utf-8');
            const parsed = matter(content);
            title = parsed.data.title || item.name;
          } catch (error) {
            console.error(`Failed to read article for ${item.name}:`, error);
          }
        }

        return { id: item.name, title };
      })
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
  }

  async createItem(type: string): Promise<ContentItem> {
    await this.ensureContentRoot();
    const typeDir = path.join(this.contentRoot, type);

    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    const items = this.listItems(type);
    const maxId = items.length > 0 ? Math.max(...items.map((item) => parseInt(item.id, 10))) : 0;
    const newId = (maxId + 1).toString();
    const newDir = this.getItemDir(type, newId);

    fs.mkdirSync(newDir, { recursive: true });

    const mediaDir = path.join(newDir, 'media');
    fs.mkdirSync(mediaDir, { recursive: true });

    const articlePath = path.join(newDir, 'article.md');
    const initialContent = `---
title: "新しい${type} ${newId}"
---

# 新しい${type} ${newId}

ここに内容を記述してください。
`;
    fs.writeFileSync(articlePath, initialContent, 'utf-8');

    return { id: newId, title: `新しい${type} ${newId}` };
  }

  deleteItem(type: string, id: string): void {
    const itemDir = this.getItemDir(type, id);
    if (fs.existsSync(itemDir)) {
      fs.rmSync(itemDir, { recursive: true, force: true });
    }
  }

  loadContent(type: string, id: string): string {
    const articlePath = path.join(this.getItemDir(type, id), 'article.md');
    return fs.readFileSync(articlePath, 'utf-8');
  }

  saveContent(type: string, id: string, content: string): void {
    const articlePath = path.join(this.getItemDir(type, id), 'article.md');
    fs.writeFileSync(articlePath, content, 'utf-8');
  }

  private getCsvPath(type: string): string {
    return path.join(this.contentRoot, type, `${type}.csv`);
  }

  loadCsvTable(type: string): TableData {
    const csvPath = this.getCsvPath(type);
    if (!fs.existsSync(csvPath)) {
      return { header: [], rows: [] };
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    return {
      header: parsed.meta.fields || [],
      rows: parsed.data as Record<string, string>[],
    };
  }

  saveCsvTable(type: string, header: string[], rows: Record<string, string>[]): void {
    const csvPath = this.getCsvPath(type);
    const csvContent = Papa.unparse({ fields: header, data: rows });
    fs.writeFileSync(csvPath, csvContent, 'utf-8');
  }

  getTableData(type: string): TableData {
    return this.loadCsvTable(type);
  }

  updateCell(type: string, id: string, column: string, value: string): void {
    const tableData = this.loadCsvTable(type);
    const row = tableData.rows.find((r) => r.id === id);

    if (row) {
      row[column] = value;
    } else {
      const newRow: Record<string, string> = { id };
      newRow[column] = value;
      tableData.rows.push(newRow);
    }

    this.saveCsvTable(type, tableData.header, tableData.rows);
  }

  resolvePath(type: string, relativePath: string): string {
    return path.join(this.contentRoot, type, relativePath);
  }

  private async ensureContentRoot(): Promise<void> {
    if (!fs.existsSync(this.contentRoot)) {
      fs.mkdirSync(this.contentRoot, { recursive: true });
    }
  }
}
