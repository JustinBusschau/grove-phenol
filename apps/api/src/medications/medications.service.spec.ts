import { Test, TestingModule } from '@nestjs/testing';
import { MedicationsService } from './medications.service';
import { PrismaService } from '../common/prisma/prisma.module';

describe('MedicationsService', () => {
  let service: MedicationsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicationsService,
        {
          provide: PrismaService,
          useValue: {
            medication: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MedicationsService>(MedicationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return array of medications', async () => {
      const mockMedications = [
        {
          id: '1',
          name: 'Aspirin',
          description: 'Pain reliever',
          concentration: '100mg',
          unit: 'tablet',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Ibuprofen',
          description: 'Anti-inflammatory',
          concentration: '200mg',
          unit: 'tablet',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaService.medication.findMany as jest.Mock).mockResolvedValue(mockMedications);

      const result = await service.findAll();

      expect(result).toEqual(mockMedications);
    });

    it('should handle empty result', async () => {
      (prismaService.medication.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return medication when found', async () => {
      const mockMedication = {
        id: '1',
        name: 'Aspirin',
        description: 'Pain reliever',
        concentration: '100mg',
        unit: 'tablet',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.medication.findUnique as jest.Mock).mockResolvedValue(mockMedication);

      const result = await service.findById('1');

      expect(result).toEqual(mockMedication);
    });

    it('should return null when not found', async () => {
      (prismaService.medication.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });
});
