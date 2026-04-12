import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // CORS configuration
  app.enableCors({
    origin: [
      configService.get('WEB_URL') || 'http://localhost:23000',
      'http://localhost:23000',
      'http://localhost:3000',
      'http://localhost:23000',
    ],
    credentials: true,
  })

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Phenol API')
    .setDescription('Medication management and infusion process checklists')
    .setVersion('1.0.0')
    .addTag('auth')
    .addTag('users')
    .addTag('medications')
    .addTag('checklists')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = configService.get('API_PORT') || 3001
  await app.listen(port)

  logger.log(`Application is running on: http://localhost:${port}`)
  logger.log(`API documentation available at: http://localhost:${port}/api/docs`)
}

bootstrap()
