import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    
    private readonly productService: ProductService,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepository.create(createCartDto);
    return this.cartRepository.save(cart);
  }

  async findByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId: userId },
      relations: ['items', 'items.product'],
    });
    
    if (!cart) {
      throw new NotFoundException(`Cart for user ID ${userId} not found`);
    }
    
    return cart;
  }

  async findOne(id: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { cartId: id },
      relations: ['items', 'items.product'],
    });
    
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    
    return cart;
  }

  async addItem(cartId: number, addItemDto: AddCartItemDto): Promise<CartItem> {
    const cart = await this.findOne(cartId);
    const product = await this.productService.findOne(addItemDto.productId);
    
    // Check if item already exists in cart
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cartId,
        productId: addItemDto.productId,
      },
    });
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += addItemDto.quantity;
      return this.cartItemRepository.save(existingItem);
    }
    
    // Create new item
    const newItem = this.cartItemRepository.create({
      cartId: cartId,
      productId: addItemDto.productId,
      quantity: addItemDto.quantity,
    });
    
    return this.cartItemRepository.save(newItem);
  }

  async removeItem(cartId: number, itemId: number): Promise<void> {
    const result = await this.cartItemRepository.delete({
      cartId: cartId,
      cartItemId: itemId,
    });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found in cart ${cartId}`);
    }
  }

  async clearCart(cartId: number): Promise<void> {
    const result = await this.cartItemRepository.delete({
      cartId: cartId,
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.cartRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
  }
} 