export interface IContentRepository {
  listContentTypes(): Promise<string[]>;
  listItems(type: string): Promise<Array<{ id: string; title: string }>>;
  loadContent(type: string, id: string): Promise<string>;
  saveContent(type: string, id: string, content: string): Promise<void>;
}
