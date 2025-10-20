import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcModule } from '../src/module/imc/imc.module';
import { ImcEntity } from '../src/module/imc/imc.entity';
import { DataSource } from 'typeorm';

process.env.NODE_ENV = 'test';

describe('IMC Integration Tests (MongoDB local)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: process.env.MONGO_URI,
          database: 'imc_test',
          synchronize: true,
          entities: [ImcEntity],
        }),
        ImcModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // Limpia la base de datos de test
    const mongoClient: any = (dataSource as any).mongoClient;
    if (mongoClient) {
      await mongoClient.db('imc_test').dropDatabase();
    }

    // Cierra la conexión del DataSource
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }

    // Cierra la app Nest
    await app.close();
  });

  describe('/imc/calcular (POST)', () => {
    it('debería calcular correctamente el IMC y guardar en DB', async () => {
      const response = await request(app.getHttpServer())
        .post('/imc/calcular')
        .send({ peso: 70, altura: 1.75 })
        .expect(201);

      expect(response.body).toHaveProperty('imcValor');
      expect(response.body.categoria).toBe('Peso normal');
    });

    it('debería rechazar si falta un campo requerido', async () => {
      await request(app.getHttpServer())
        .post('/imc/calcular')
        .send({ peso: 80 })
        .expect(400);
    });
  });

  describe('/imc/historial (GET)', () => {
    it('debería devolver el historial de IMC', async () => {
      const response = await request(app.getHttpServer())
        .get('/imc/historial')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
