import { Injectable } from '@angular/core';

const DRAFT_KEY = 'tc_application_draft';

@Injectable({ providedIn: 'root' })
export class DraftService {
  save(data: unknown): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      // storage unavailable — silently skip
    }
  }

  load<T>(): T | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(DRAFT_KEY);
  }

  exists(): boolean {
    return localStorage.getItem(DRAFT_KEY) !== null;
  }
}
