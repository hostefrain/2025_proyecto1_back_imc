import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { ImcModule } from './module/imc/imc.module';
import { AppController } from './app.controller';
import { ImcEntity } from './module/imc/imc.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ImcModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [ImcEntity],
        synchronize: false, // 👈 IMPORTANTE: false en producción
        ssl: {
          rejectUnauthorized: false,
        },
        logging: false, // 👈 Desactivar logs en producción
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}