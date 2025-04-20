import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api-gateway/src/modules/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
}
