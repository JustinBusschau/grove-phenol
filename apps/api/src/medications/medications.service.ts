import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.module';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.medication.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.medication.findUnique({
      where: { id },
      include: {
        checklists: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    concentration: string;
    unit: string;
  }) {
    return this.prisma.medication.create({
      data,
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    concentration?: string;
    unit?: string;
    isActive?: boolean;
  }) {
    return this.prisma.medication.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string) {
    return this.prisma.medication.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
