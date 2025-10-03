import { Injectable, Inject } from '@nestjs/common';
import { IImcRepository } from './IImcRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImcEntity } from './imc.entity';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { CrearImcDto } from './dto/crear-imc-dto';

@Injectable()
export class ImcService {
  constructor(
    @Inject('IImcRepository')
    private readonly repository: IImcRepository,
  ) {}

  async createImc(data: CalcularImcDto): Promise<CrearImcDto> {
    const imcValor = this.calcularImc(data);
    const categoria = this.obtenerCategoria(imcValor);

    // Mapear DTO → Entity
    const entity = new ImcEntity();
    entity.altura = data.altura;
    entity.peso = data.peso;
    entity.imc = imcValor;
    entity.categoria = categoria;

    const guardado = await this.repository.save(entity);

    // Mapear Entity → DTO de salida
    const dto = new CrearImcDto();
    dto.altura = guardado.altura;
    dto.peso = guardado.peso;
    dto.imcValor = guardado.imc;
    dto.categoria = guardado.categoria;
    dto.fechaHora = guardado.fechaHora;

    return dto;
  }

  async findAll(): Promise<ImcEntity[]> {
    return this.repository.findAll();
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
