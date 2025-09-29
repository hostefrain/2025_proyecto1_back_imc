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
            ssl: true,
            sslValidate: false,   // ignora validación estricta del certificado
            logging: false,
          };
        } else {
          // En desarrollo, usa variables separadas
          return {
            type: 'mysql',
            host: configService.get<string>('MYSQL_HOST', 'shortline.proxy.rlwy.net'),
            port: configService.get<number>('MYSQL_PORT', 21468),
            username: configService.get<string>('MYSQL_USER', 'root'),
            password: configService.get<string>('MYSQL_PASSWORD'),
            database: configService.get<string>('MYSQL_DB', 'railway'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: false,
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