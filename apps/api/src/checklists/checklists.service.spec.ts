import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistsService } from './checklists.service';
import { PrismaService } from '../common/prisma/prisma.module';

describe('ChecklistsService', () => {
  let service: ChecklistsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsService,
        {
          provide: PrismaService,
          useValue: {
            infusionChecklist: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            checklistStep: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            auditEvent: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChecklistsService>(ChecklistsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return array of checklists', async () => {
      const mockChecklists = [
        {
          id: '1',
          patientId: 'patient1',
          medicationId: 'med1',
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaService.infusionChecklist.findMany as jest.Mock).mockResolvedValue(mockChecklists);

      const result = await service.findAll();

      expect(result).toEqual(mockChecklists);
    });

    it('should handle empty result', async () => {
      (prismaService.infusionChecklist.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return checklist when found', async () => {
      const mockChecklist = {
        id: '1',
        patientId: 'patient1',
        medicationId: 'med1',
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.infusionChecklist.findUnique as jest.Mock).mockResolvedValue(mockChecklist);

      const result = await service.findById('1');

      expect(result).toEqual(mockChecklist);
    });

    it('should return null when not found', async () => {
      (prismaService.infusionChecklist.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });
});
