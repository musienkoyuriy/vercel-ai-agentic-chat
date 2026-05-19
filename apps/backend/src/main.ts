import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

type AppEnv = {
  UI_URL: string;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnv>);
  const uiUrl = config.getOrThrow<string>('UI_URL');
  app.enableCors({
    origin: uiUrl,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
