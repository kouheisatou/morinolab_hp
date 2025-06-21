import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import Papa from 'papaparse';
import type { IContentRepository } from '@domain/ports/IContentRepository';

export class ContentRepository implements IContentRepository {
  constructor(private contentRoot: string) {}

  setRoot(root: string) {
    this.contentRoot = root;
  }

  private ensureRoot() {
    if (!fs.existsSync(this.contentRoot)) fs.mkdirSync(this.contentRoot, { recursive: true });
  }

  async listContentTypes(): Promise<string[]> {
    this.ensureRoot();
    return fs
      .readdirSync(this.contentRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }

  async listItems(type: string): Promise<Array<{ id: string; title: string }>> {
    const typeDir = path.join(this.contentRoot, type);
    if (!fs.existsSync(typeDir)) return [];
    return fs
      .readdirSync(typeDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => {
        const articlePath = path.join(typeDir, d.name, 'article.md');
        let title = '';
        if (fs.existsSync(articlePath)) {
          try {
            const file = fs.readFileSync(articlePath, 'utf8');
            const { data } = matter(file);
            // gray-matter returns `data` as unknown front-matter object
            title = (data as { title?: string }).title ?? '';
          } catch {
            /* ignore */
          }
        }
        return { id: d.name, title };
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
  }

  async loadContent(type: string, id: string): Promise<string> {
    const articlePath = path.join(this.contentRoot, type, id, 'article.md');
    return fs.existsSync(articlePath) ? fs.readFileSync(articlePath, 'utf8') : '';
  }

  async saveContent(type: string, id: string, content: string): Promise<void> {
    const dir = path.join(this.contentRoot, type, id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const articlePath = path.join(dir, 'article.md');
    fs.writeFileSync(articlePath, content, 'utf8');
  }

  // ---------------- CSV utils & CRUD ----------------
  private getCsvPath(type: string) {
    return path.join(this.contentRoot, type, `${type}.csv`);
  }

  private loadCsvTable(type: string): { header: string[]; rows: Record<string, string>[] } {
    const csvPath = this.getCsvPath(type);
    if (!fs.existsSync(csvPath)) return { header: ['id'], rows: [] };
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
    });
    const header: string[] = parsed.meta.fields ?? [];
    const rows: Record<string, string>[] = parsed.data;
    return { header, rows };
  }

  private saveCsvTable(type: string, header: string[], rows: Record<string, string>[]) {
    const csvPath = this.getCsvPath(type);
    const csvText =
      rows.length === 0 ? header.join(',') + '\n' : Papa.unparse(rows, { columns: header });
    fs.writeFileSync(csvPath, csvText, 'utf8');
  }

  async createItem(type: string): Promise<{ id: string; title: string }> {
    this.ensureRoot();
    const typeDir = path.join(this.contentRoot, type);
    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });

    const ids = fs
      .readdirSync(typeDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => Number(d.name))
      .filter((n) => !isNaN(n));
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const itemDir = path.join(typeDir, String(newId));
    fs.mkdirSync(itemDir);

    const template = `---\ntitle: 新規記事\n---\n\n# 見出し\n\nここに本文を書いてください\n`;
    fs.writeFileSync(path.join(itemDir, 'article.md'), template, 'utf8');

    const { header, rows } = this.loadCsvTable(type);
    if (!header.includes('id')) header.unshift('id');
    const newRow: Record<string, string> = {};
    header.forEach((h) => (newRow[h] = ''));
    newRow['id'] = String(newId);
    rows.push(newRow);
    this.saveCsvTable(type, header, rows);

    return { id: String(newId), title: '新規記事' };
  }

  async deleteItem(type: string, id: string): Promise<void> {
    const dir = path.join(this.contentRoot, type, id);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

    const typeDir = path.join(this.contentRoot, type);
    const thumbPattern = new RegExp(`^${id}\\.(png|jpe?g|gif|webp)$`, 'i');
    fs.readdirSync(typeDir)
      .filter((f) => thumbPattern.test(f))
      .forEach((f) => fs.rmSync(path.join(typeDir, f), { force: true }));

    const { header, rows } = this.loadCsvTable(type);
    const newRows = rows.filter((r) => String(r.id) !== String(id));
    this.saveCsvTable(type, header, newRows);
  }

  async getTableData(type: string): Promise<{ header: string[]; rows: Record<string, string>[] }> {
    return this.loadCsvTable(type);
  }

  async updateCell(type: string, id: string, column: string, value: string): Promise<void> {
    const { header, rows } = this.loadCsvTable(type);
    const row = rows.find((r) => String(r.id) === String(id));
    if (row) {
      row[column] = value;
      this.saveCsvTable(type, header, rows);
    }
  }
}
