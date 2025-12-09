import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { configConstants, envConfiguration } from './config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { CategoryModule } from './modules/category/category.module';
import { AllExceptionsFilter } from './error/allExceptionsFilter';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');
        const ttl = configService.get<number>('REDIS_TTL');
        return {
          store: redisStore,
          options: {
            host,
            port,
            ttl,
          },
        };
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm, envConfiguration],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const options = configService.get<TypeOrmModuleOptions>(
          configConstants.TYPEORM,
        );
        if (!options) {
          throw new Error('TypeORM configuration is missing');
        }
        return options;
      },
    }),
    CategoryModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    // Global Pipes
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },

    // Global Serializer
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },

    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
