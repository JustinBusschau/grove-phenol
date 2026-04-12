import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.module';

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.infusionChecklist.findMany({
      include: {
        medication: true,
        clinician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.infusionChecklist.findUnique({
      where: { id },
      include: {
        medication: true,
        clinician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
        auditEvents: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: {
    patientId: string;
    clinicianId: string;
    medicationId?: string;
    notes?: string;
  }) {
    // Get template steps
    const templateSteps = await this.prisma.checklistStep.findMany({
      where: { checklistId: null },
      orderBy: { order: 'asc' },
    });

    const checklist = await this.prisma.infusionChecklist.create({
      data: {
        ...data,
        status: 'DRAFT',
        steps: {
          create: templateSteps.map((step: { title: string; description: string | null; order: number }) => ({
            title: step.title,
            description: step.description,
            order: step.order,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Create audit event
    await this.createAuditEvent({
      userId: data.clinicianId,
      action: 'CREATE_CHECKLIST',
      resourceType: 'InfusionChecklist',
      resourceId: checklist.id,
      newValues: checklist,
    });

    return checklist;
  }

  async startChecklist(id: string, userId: string) {
    const checklist = await this.prisma.infusionChecklist.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });

    await this.createAuditEvent({
      userId,
      action: 'START_CHECKLIST',
      resourceType: 'InfusionChecklist',
      resourceId: id,
      newValues: { status: 'ACTIVE', startedAt: checklist.startedAt },
    });

    return checklist;
  }

  async completeStep(checklistId: string, stepId: string, userId: string, notes?: string) {
    const step = await this.prisma.checklistStep.update({
      where: { id: stepId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completedBy: userId,
        notes,
      },
    });

    await this.createAuditEvent({
      userId,
      action: 'COMPLETE_STEP',
      resourceType: 'ChecklistStep',
      resourceId: stepId,
      checklistId,
      checklistStepId: stepId,
      newValues: {
        isCompleted: true,
        completedAt: step.completedAt,
        completedBy: userId,
      },
    });

    return step;
  }

  async completeChecklist(id: string, userId: string) {
    // Verify all steps are completed
    const incompleteSteps = await this.prisma.checklistStep.count({
      where: {
        checklistId: id,
        isCompleted: false,
      },
    });

    if (incompleteSteps > 0) {
      throw new Error('Cannot complete checklist with incomplete steps');
    }

    const checklist = await this.prisma.infusionChecklist.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await this.createAuditEvent({
      userId,
      action: 'COMPLETE_CHECKLIST',
      resourceType: 'InfusionChecklist',
      resourceId: id,
      newValues: { status: 'COMPLETED', completedAt: checklist.completedAt },
    });

    return checklist;
  }

  async cancelChecklist(id: string, userId: string, reason?: string) {
    const checklist = await this.prisma.infusionChecklist.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason,
      },
    });

    await this.createAuditEvent({
      userId,
      action: 'CANCEL_CHECKLIST',
      resourceType: 'InfusionChecklist',
      resourceId: id,
      newValues: { status: 'CANCELLED', notes: reason },
    });

    return checklist;
  }

  private async createAuditEvent(data: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    checklistId?: string;
    checklistStepId?: string;
    newValues?: unknown;
    oldValues?: unknown;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        ...data,
        ipAddress: '127.0.0.1', // TODO: Get from request
        userAgent: 'Phenol API', // TODO: Get from request
      },
    } as any);
  }
}
