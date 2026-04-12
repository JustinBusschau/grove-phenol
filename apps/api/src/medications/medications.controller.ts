import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MedicationsService } from './medications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('medications')
@Controller('medications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active medications' })
  @ApiResponse({ status: 200, description: 'Medications retrieved successfully' })
  async findAll() {
    return this.medicationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medication by ID' })
  @ApiResponse({ status: 200, description: 'Medication found' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async findById(@Param('id') id: string) {
    return this.medicationsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Create new medication' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() data: {
    name: string;
    description?: string;
    concentration: string;
    unit: string;
  }) {
    return this.medicationsService.create(data);
  }

  @Put(':id')
  @Roles('ADMIN', 'CLINICIAN')
  @ApiOperation({ summary: 'Update medication' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async update(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
      concentration?: string;
      unit?: string;
      isActive?: boolean;
    }
  ) {
    return this.medicationsService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate medication (soft delete)' })
  @ApiResponse({ status: 200, description: 'Medication deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async deactivate(@Param('id') id: string) {
    return this.medicationsService.deactivate(id);
  }
}
