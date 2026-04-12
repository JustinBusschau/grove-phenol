import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('checklists')
@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Get all infusion checklists' })
  @ApiResponse({ status: 200, description: 'Checklists retrieved successfully' })
  async findAll() {
    return this.checklistsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Get checklist by ID with full details' })
  @ApiResponse({ status: 200, description: 'Checklist found' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async findById(@Param('id') id: string) {
    return this.checklistsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Create new infusion checklist' })
  @ApiResponse({ status: 201, description: 'Checklist created successfully' })
  async create(@Body() data: {
    patientId: string;
    medicationId?: string;
    notes?: string;
  }, @Request() req: AuthenticatedRequest) {
    return this.checklistsService.create({
      ...data,
      clinicianId: req.user.id,
    });
  }

  @Put(':id/start')
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Start infusion checklist' })
  @ApiResponse({ status: 200, description: 'Checklist started successfully' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async startChecklist(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.checklistsService.startChecklist(id, req.user.id);
  }

  @Put(':id/steps/:stepId/complete')
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Complete a checklist step' })
  @ApiResponse({ status: 200, description: 'Step completed successfully' })
  @ApiResponse({ status: 404, description: 'Step not found' })
  async completeStep(
    @Param('id') checklistId: string,
    @Param('stepId') stepId: string,
    @Body() data: { notes?: string },
    @Request() req: AuthenticatedRequest
  ) {
    return this.checklistsService.completeStep(
      checklistId, 
      stepId, 
      req.user.id, 
      data.notes
    );
  }

  @Put(':id/complete')
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Complete entire checklist' })
  @ApiResponse({ status: 200, description: 'Checklist completed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot complete checklist with incomplete steps' })
  async completeChecklist(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.checklistsService.completeChecklist(id, req.user.id);
  }

  @Put(':id/cancel')
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Cancel checklist' })
  @ApiResponse({ status: 200, description: 'Checklist cancelled successfully' })
  async cancelChecklist(
    @Param('id') id: string,
    @Body() data: { reason?: string },
    @Request() req: AuthenticatedRequest
  ) {
    return this.checklistsService.cancelChecklist(id, req.user.id, data.reason);
  }
}
