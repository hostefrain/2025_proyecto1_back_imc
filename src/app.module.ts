import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImcEntity } from './module/imc/imc.entity'; // 👈 tus entidades

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // disponible en toda la app
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Solo en desarrollo
        ssl: {
          rejectUnauthorized: false, // necesario en Render (usa SSL)
        },
      }),
    }),
    TypeOrmModule.forFeature([ImcEntity]),
  ],
})
export class AppModule {}
