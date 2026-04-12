import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.module';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async getHealth() {
    const dbStatus = await this.checkDatabase();
    
    return {
      status: dbStatus.connected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'phenol-api',
      version: '1.0.0',
      database: dbStatus,
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  async getReadiness() {
    const dbStatus = await this.checkDatabase();
    
    return {
      status: dbStatus.connected ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus.connected,
      },
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { connected: true };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      };
    }
  }
}
