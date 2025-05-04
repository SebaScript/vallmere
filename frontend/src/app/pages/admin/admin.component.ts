import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  view: 'list' | 'add' | 'edit' = 'list';
  productForm: FormGroup;
  private editId: number | null = null;

  constructor(private fb: FormBuilder) {
    // Inicializar formulario
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    // Aquí puedes reemplazar con llamada a un servicio HTTP
    this.products = [
      { id: 1, name: 'Camiseta', price: 19.99 },
      { id: 2, name: 'Pantalones', price: 39.99 },
      { id: 3, name: 'Zapatos', price: 59.99 }
    ];
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const { name, price } = this.productForm.value;

    if (this.view === 'add') {
      const newId = this.products.length ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
      this.products.push({ id: newId, name, price });
    } else if (this.view === 'edit' && this.editId !== null) {
      const index = this.products.findIndex(p => p.id === this.editId);
      if (index > -1) {
        this.products[index] = { id: this.editId, name, price };
      }
    }

    this.cancel();
  }

  editProduct(product: Product): void {
    this.view = 'edit';
    this.editId = product.id;
    this.productForm.setValue({
      name: product.name,
      price: product.price
    });
  }

  cancel(): void {
    this.view = 'list';
    this.editId = null;
    this.productForm.reset({ name: '', price: 0 });
  }
}
