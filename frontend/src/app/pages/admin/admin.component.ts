import { Component, OnInit } from '@angular/core'; import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms'; import { CommonModule } from '@angular/common'; import { ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../shared/interfaces/product.interface';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService, Category } from '../../shared/services/category.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})


export class AdminComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  view: 'list' | 'add' | 'edit' = 'list';
  productForm: FormGroup;
  loading = false;
  error: string | null = null;
  private editId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      imageUrl: ['', Validators.required], // Main image URL
      carouselUrl: this.fb.array([]), // Additional images array
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });

    // Watch for changes in the main imageUrl and update carouselUrl accordingly
    this.productForm.get('imageUrl')?.valueChanges.subscribe(url => {
      if (url && this.carouselUrl.length === 0) {
        this.carouselUrl.push(this.fb.control(url));
      } else if (url) {
        this.carouselUrl.at(0).setValue(url, { emitEvent: false });
      }
    });
  }

  // Getter for easy access to the carouselUrl FormArray
  get carouselUrl() {
    return this.productForm.get('carouselUrl') as FormArray;
  }

  // Method to add a new URL field
  addImageUrl() {
    this.carouselUrl.push(this.fb.control('', Validators.required));
  }

  // Method to remove a URL field
  removeImageUrl(index: number) {
    if (index === 0) {
      return; // Don't allow removing the main image
    }
    this.carouselUrl.removeAt(index);
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.error = 'Failed to load categories';
      }
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      alert(`Invalid form, please fill all fields correctly.`);
      return;
    }

    this.loading = true;
    const formValue = this.productForm.value;
    const productData = {
      ...formValue,
      imageUrl: formValue.imageUrl,
      carouselUrl: [formValue.imageUrl, ...formValue.carouselUrl.slice(1)] // Ensure main image is first in carousel
    };

    if (this.view === 'add') {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.loadProducts();
          this.cancel();
        },
        error: (err) => {
          console.error('Error creating product', err);
          this.error = 'Failed to create product';
          this.loading = false;
        }
      });
    } else if (this.view === 'edit' && this.editId !== null) {
      this.productService.updateProduct(this.editId, productData).subscribe({
        next: () => {
          this.loadProducts();
          this.cancel();
        },
        error: (err) => {
          console.error('Error updating product', err);
          this.error = 'Failed to update product';
          this.loading = false;
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.view = 'edit';
    this.editId = product.id;

    // Clear existing URLs
    while (this.carouselUrl.length) {
      this.carouselUrl.removeAt(0);
    }

    // Set the main image
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category,
      stock: product.stock
    });

    // Add all carousel URLs (skipping the first one as it's already set as imageUrl)
    if (product.carouselUrl && product.carouselUrl.length > 1) {
      product.carouselUrl.slice(1).forEach(url => {
        this.carouselUrl.push(this.fb.control(url));
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product', err);
          this.error = 'Failed to delete product';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.view = 'list';
    this.editId = null;
    this.error = null;

    // Reset the form
    this.productForm.reset({
      name: '',
      price: 0,
      imageUrl: '',
      description: '',
      category: '',
      stock: 0
    });

    // Clear carousel URLs
    while (this.carouselUrl.length) {
      this.carouselUrl.removeAt(0);
    }
  }
}
