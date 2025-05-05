import { Component, OnInit } from '@angular/core'; import { FormBuilder, FormGroup, Validators } from '@angular/forms'; import { CommonModule } from '@angular/common'; import { ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../shared/interfaces/product.interface';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})


export class AdminComponent implements OnInit {
  products: Product[] = [];
  view: 'list' | 'add' | 'edit' = 'list';
  productForm: FormGroup;
  private editId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group(
      { name: ['', [Validators.required, Validators.minLength(3)]],
        price: [0, [Validators.required, Validators.min(0.01)]],
        imageUrl: ['', Validators.required],
        description: ['', [Validators.required, Validators.minLength(10)]],
        category: ['', Validators.required],
        stock: [0, [Validators.required, Validators.min(0)]]
      });
    }

  ngOnInit(): void {
    this.loadProducts();
    console.log(this.products);
  }

  private loadProducts(): void {
    const data = sessionStorage.getItem('products');
    this.products = data ? JSON.parse(data) : [];
  }

  private saveProducts(): void {
    sessionStorage.setItem('products', JSON.stringify(this.products));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      alert(`Invalid form, please fill all fields correctly. ${this.productForm.errors}`);
      return;
    }

    const { name, price, imageUrl, description, category, stock } = this.productForm.value;

    if (this.view === 'add') {
      const newId = this.products.length ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
      this.products.push({ id: newId, name, price, imageUrl, description, category, stock });
    } else if (this.view === 'edit' && this.editId !== null) {
      const idx = this.products.findIndex(p => p.id === this.editId);
      if (idx > -1) {
        this.products[idx] = { id: this.editId, name, price, imageUrl, description, category, stock };
      }
    }

    this.saveProducts();
    this.cancel();
  }

  editProduct(product: Product): void {
    this.view = 'edit';
    this.editId = product.id;
    this.productForm.setValue({
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category,
      stock: product.stock });
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
  }

  cancel(): void {
    this.view = 'list';
    this.editId = null;
    this.productForm.reset({
      name: '',
      price: 0,
      imageUrl: '',
      description: '',
      category: '',
      stock: 0 });
  }
}
