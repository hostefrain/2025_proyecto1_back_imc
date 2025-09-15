import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcModule } from './module/imc/imc.module';
import { truncate } from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        if (isProduction) {
          // En producción, usa la Internal Database URL completa
          return {
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'), // 👈 URL completa
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // NUNCA true en producción
            ssl: { rejectUnauthorized: false },
            logging: false,
          };
        } else {
          // En desarrollo, usa variables separadas
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME', 'imc_db'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: false,
            logging: true,
          };
        }
      },
    }),
    ImcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}