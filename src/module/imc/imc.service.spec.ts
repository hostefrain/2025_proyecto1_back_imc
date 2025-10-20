import { Test, TestingModule } from '@nestjs/testing';
import { ImcService } from './imc.service';
import { IImcRepository } from './IImcRepository';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { ImcEntity } from './imc.entity';

describe('ImcService', () => {
  let service: ImcService;
  let repositoryMock: jest.Mocked<IImcRepository>;

  beforeEach(async () => {
    repositoryMock = {
      save: jest.fn(async (entity: ImcEntity) => ({
        ...entity,
        id: '123',
        fechaHora: new Date(),
      })),
      findAll: jest.fn(async () => []),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImcService,
        { provide: 'IImcRepository', useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<ImcService>(ImcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate and save IMC correctly (Peso normal)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 70 };

    const result = await service.createImc(dto);

    expect(repositoryMock.save).toHaveBeenCalled();
    expect(result.imcValor).toBeCloseTo(22.86, 2);
    expect(result.categoria).toBe('Peso normal');
  });

  it('should return Bajo peso for IMC < 18.5', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 50 };

    const result = await service.createImc(dto);

    expect(result.imcValor).toBeCloseTo(16.33, 2);
    expect(result.categoria).toBe('Bajo peso');
  });

  it('should return Sobrepeso for 25 <= IMC < 30', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 80 };

    const result = await service.createImc(dto);

    expect(result.imcValor).toBeCloseTo(26.12, 2);
    expect(result.categoria).toBe('Sobrepeso');
  });

  it('should return Obesidad for IMC >= 30', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 100 };

    const result = await service.createImc(dto);

    expect(result.imcValor).toBeCloseTo(32.65, 2);
    expect(result.categoria).toBe('Obesidad');
  });

  it('should call repository.findAll() on findAll()', async () => {
    await service.findAll();
    expect(repositoryMock.findAll).toHaveBeenCalled();
  });
});
