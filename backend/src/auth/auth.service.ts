import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (user && isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async validateOAuthUser(oauthUser: any): Promise<any> {
    try {
      // Try to find existing user by email
      const existingUser = await this.userService.findByEmail(oauthUser.email);
      
      const { password, ...result } = existingUser;
      return result;
    } catch (error) {
      // User doesn't exist, create new user
      const newUserDto: CreateUserDto = {
        name: oauthUser.name,
        email: oauthUser.email,
        password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        role: 'client',
      };
      
      const newUser = await this.userService.create(newUserDto);
      const { password, ...result } = newUser;
      return result;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userService.findByEmail(loginDto.email);
      
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { 
        email: user.email, 
        sub: user.userId, 
        role: user.role,
        name: user.name 
      };

      const { password, ...result } = user;
      
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async oauthLogin(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.userId, 
      role: user.role,
      name: user.name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      
      const payload = { 
        email: user.email, 
        sub: user.userId, 
        role: user.role,
        name: user.name 
      };
      
      const { password, ...result } = user;
      
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new UnauthorizedException('Email already registered');
      }
      throw error;
    }
  }

  async getProfile(userId: number) {
    const user = await this.userService.findOne(userId);
    const { password, ...result } = user;
    return result;
  }
} 