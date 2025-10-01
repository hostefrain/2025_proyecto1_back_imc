import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImcEntity } from './imc.entity';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { CrearImcDto } from './dto/crear-imc-dto';   // 👈 Importar DTO de salida

@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcEntity)
    private readonly repository: Repository<ImcEntity>,
  ) {}

  async findAll(): Promise<ImcEntity[]> {
    return this.repository.find();
  }

  async createImc(data: CalcularImcDto): Promise<CrearImcDto> {
    console.log('Datos recibidos:', data);

    const imcValor = this.calcularImc(data);
    const categoria = this.obtenerCategoria(imcValor);

    // Creamos entidad para guardar en Mongo
    const nuevo = this.repository.create({
      altura: data.altura,
      peso: data.peso,
      imc: imcValor,
      categoria,
    });

    const guardado = await this.repository.save(nuevo);

    console.log('Entity guardada:', guardado);

    // 👇 Mapear manualmente a DTO de salida
    const dto = new CrearImcDto();
    dto.altura = guardado.altura;
    dto.peso = guardado.peso;
    dto.imcValor = guardado.imc;   // mapeo manual
    dto.categoria = guardado.categoria;
    dto.fechaHora = guardado.fechaHora;

    return dto;
  }

  private calcularImc(data: CalcularImcDto): number {
    return data.peso / (data.altura * data.altura);
  }

  private obtenerCategoria(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }
}
