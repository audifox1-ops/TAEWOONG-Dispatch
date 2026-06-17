import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 개발 환경에서는 localhost/127.0.0.1의 어떤 포트에서든 접근을 허용한다.
  const allowedWebUrl = process.env.WEB_URL;
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedWebUrl && origin === allowedWebUrl) {
        callback(null, true);
        return;
      }

      if (isLocalOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  // 전역 유효성 검증 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API 문서 설정
  const config = new DocumentBuilder()
    .setTitle('배차지시서 통합 관리 API')
    .setDescription('생산 현장 배차 업무 관리 시스템의 REST API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 액세스 토큰을 입력하세요.',
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
  console.log(`배차지시서 API 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`Swagger 문서: http://localhost:${port}/api/docs`);
}

bootstrap();
