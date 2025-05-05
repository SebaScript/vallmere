import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _selected = signal<string>('New');

  selectedCategory = this._selected.asReadonly();

  setCategory(cat: string) {
    this._selected.set(cat);
  }
}
