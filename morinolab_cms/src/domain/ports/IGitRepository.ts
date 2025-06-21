import type { RepositoryInfo } from '@domain/models/RepositoryInfo';

export interface CloneProgress {
  message: string;
  percent: number; // 0-100
}

export interface IGitRepository {
  /** 認証トークン設定（必要なら） */
  authenticate(token: string): Promise<boolean>;
  /** 対象リポジトリの設定 */
  setRepository(info: RepositoryInfo, token: string): void;

  /** クローン */
  clone(progress?: (p: CloneProgress) => void): Promise<boolean>;
  /** 最新を取得 */
  pull(): Promise<{
    success: boolean;
    error?: string;
    hasConflicts?: boolean;
    conflicts?: string[];
  }>;
  /** 変更を commit & push */
  commitAndPush(
    message: string,
    progress?: (p: CloneProgress) => void,
  ): Promise<{ success: boolean; error?: string; hasConflicts?: boolean; conflicts?: string[] }>;

  /** リポジトリ情報 */
  getInfo(): Promise<RepositoryInfo | null>;
}
