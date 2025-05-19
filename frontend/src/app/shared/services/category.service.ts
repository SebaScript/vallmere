import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _selected = signal<string>('New');
  selectedCategory = this._selected.asReadonly();

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadCategories();
  }

  setCategory(cat: string) {
    this._selected.set(cat);
  }

  loadCategories(): void {
    this.apiService.get<any[]>('categories')
      .pipe(
        map(categories =>
          categories.map(cat => ({
            id: cat.categoryId,
            name: cat.name
          }))
        )
      )
      .subscribe(categories => {
        this.categoriesSubject.next(categories);
      });
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getCategoryById(id: number): Observable<Category> {
    return this.apiService.getById<any>('categories', id)
      .pipe(
        map(cat => ({
          id: cat.categoryId,
          name: cat.name
        }))
      );
  }

  createCategory(name: string): Observable<Category> {
    return this.apiService.post<any>('categories', { name })
      .pipe(
        map(cat => {
          const newCategory = {
            id: cat.categoryId,
            name: cat.name
          };
          const currentCategories = this.categoriesSubject.value;
          this.categoriesSubject.next([...currentCategories, newCategory]);
          return newCategory;
        })
      );
  }

  updateCategory(id: number, name: string): Observable<Category> {
    return this.apiService.patch<any>('categories', id, { name })
      .pipe(
        map(cat => {
          const updatedCategory = {
            id: cat.categoryId,
            name: cat.name
          };

          const currentCategories = this.categoriesSubject.value;
          const updatedCategories = currentCategories.map(c =>
            c.id === id ? updatedCategory : c
          );

          this.categoriesSubject.next(updatedCategories);
          return updatedCategory;
        })
      );
  }

  deleteCategory(id: number): Observable<void> {
    return this.apiService.delete<void>('categories', id)
      .pipe(
        map(() => {
          const currentCategories = this.categoriesSubject.value;
          const updatedCategories = currentCategories.filter(c => c.id !== id);
          this.categoriesSubject.next(updatedCategories);
        })
      );
  }
}
