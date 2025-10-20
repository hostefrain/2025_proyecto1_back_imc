import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcModule } from './module/imc/imc.module';

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
          return {
            type: 'mongodb',
            url: configService.get<string>('DATABASE_URL'), // 👈 URL completa
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // NUNCA true en producción
            // ssl: true,
            logging: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
          };
        } else {
          // En desarrollo, usa variables separadas
          return {
            type: 'mongodb',
            url: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/imc_dev'),
            database: 'imc_dev', // nombre de base local
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: true,
          }}
      },
    }),
    ImcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}