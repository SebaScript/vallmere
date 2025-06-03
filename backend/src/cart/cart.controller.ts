import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto, @GetUser() user: any) {
    // Asegurar que el usuario solo puede crear su propio carrito
    return this.cartService.create({ ...createCartDto, userId: user.userId });
  }

  @Get('my-cart')
  findMyCart(@GetUser() user: any) {
    return this.cartService.findByUserId(user.userId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.cartService.findByUserId(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() addItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(+id, addItemDto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(+id, +itemId);
  }

  @Delete(':id/items')
  clearCart(@Param('id') id: string) {
    return this.cartService.clearCart(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
} 