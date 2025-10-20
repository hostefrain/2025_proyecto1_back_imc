import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from './imc.controller';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { CrearImcDto } from './dto/crear-imc-dto';
import { ImcEntity } from './imc.entity';
import { ObjectId } from 'mongodb'; // 👈 necesario para simular IDs válidos

describe('ImcController', () => {
  let controller: ImcController;
  let service: ImcService;

  const mockImcService = {
    createImc: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImcController],
      providers: [
        {
          provide: ImcService,
          useValue: mockImcService,
        },
      ],
    }).compile();

    controller = module.get<ImcController>(ImcController);
    service = module.get<ImcService>(ImcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calcular', () => {
    it('should call ImcService.createImc and return result', async () => {
      const dto: CalcularImcDto = { peso: 70, altura: 1.75 };

      // 🔹 Creamos un ObjectId simulado válido
      const mockId = new ObjectId();

      const expected: CrearImcDto = {
        id: mockId,
        peso: 70,
        altura: 1.75,
        imcValor: 22.86,
        categoria: 'Peso normal',
        fechaHora: new Date(),
      };

      mockImcService.createImc.mockResolvedValue(expected);

      const result = await controller.calcular(dto);

      expect(service.createImc).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should throw validation error if invalid data provided (handled by ValidationPipe)', async () => {
      mockImcService.createImc.mockRejectedValue(new Error('Validation failed'));

      await expect(
        controller.calcular({ peso: null, altura: 1.8 } as any),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    it('should return all IMC entries', async () => {
      const mockData: ImcEntity[] = [
        {
          id: new ObjectId(),
          peso: 70,
          altura: 1.75,
          imc: 22.86,
          categoria: 'Peso normal',
          fechaHora: new Date(),
        },
      ];

      mockImcService.findAll.mockResolvedValue(mockData);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
});
