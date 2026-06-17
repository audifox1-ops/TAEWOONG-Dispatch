import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (개발 환경)
  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 전역 유효성 검사 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성 전달 시 에러
      transform: true,           // 타입 자동 변환
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API 문서 설정
  const config = new DocumentBuilder()
    .setTitle('배차지시서 통합 관리 API')
    .setDescription('생산 현장 배차 업무 디지털화 시스템의 REST API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 액세스 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 배차지시서 API 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`📚 Swagger 문서: http://localhost:${port}/api/docs`);
}

bootstrap();
