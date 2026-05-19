import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as chatSchema from './chat/schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const schema = {
  ...chatSchema,
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');
        console.log('CONNECTION STRING', connectionString);
        const pool = new Pool({
          connectionString,
        });

        return drizzle(pool, {
          schema,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
