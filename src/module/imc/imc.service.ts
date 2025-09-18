import { Inject, Injectable } from "@nestjs/common";
import { CalcularImcDto } from "./dto/calcular-imc-dto";
import { ImcEntity } from "./imc.entity";
import { CrearImcDto } from "./dto/crear-imc-dto";
import { IImcRepository } from "./IImcRepository";


@Injectable()
export class ImcService {

  constructor(
    @Inject('IImcRepository')
    private readonly repository: IImcRepository,
  ) {}

  // Método para obtener todos los registros

  async findAll(): Promise<CrearImcDto[]> {
    const resultado = await this.repository.find();

    return resultado.map(this.mapToResponseDto);
  }

  calcularImc(data: CalcularImcDto): number {
    const { altura, peso } = data;
    const imc = peso / (altura * altura);
    const imcRedondeado = Math.round(imc * 100) / 100; // Dos decimales

    return imcRedondeado;
  }

  obtenerCategoria(imcValor: number): string {
    let categoria: string;

    if (imcValor < 18.5) {
      categoria = 'Bajo peso';
    } else if (imcValor < 25) {
      categoria = 'Normal';
    } else if (imcValor < 30) {
      categoria = 'Sobrepeso';
    } else {
      categoria = 'Obeso';
    }

    return categoria;
  }
  
 async createImc(data: CalcularImcDto): Promise<CrearImcDto> {
  console.log('Datos recibidos:', data); // Log 1

  const imcValor = this.calcularImc(data);

  const categoria = this.obtenerCategoria(imcValor);

  console.log('IMC calculado:', imcValor, 'Categoría:', categoria); // Log 2

  const {altura, peso} = data;

  //fecha y hora se ingresan solos gracias a @CreateDateColumn()

  //Crear Entity
  const imcEntity = new ImcEntity();
  imcEntity.altura = altura;
  imcEntity.peso = peso;
  imcEntity.imcValor = imcValor;
  imcEntity.categoria = categoria;

  console.log('Entity antes de guardar:', imcEntity); // Log 3

  const guardado = await this.repository.save(imcEntity);

  console.log('Entity guardada:', guardado); // Log 4

  return this.mapToResponseDto(guardado);

 }

 private mapToResponseDto(calculo: ImcEntity): CrearImcDto {
  return {
    id: calculo.id,
    altura: calculo.altura,
    peso: calculo.peso,
    imcValor: calculo.imcValor,
    categoria: calculo.categoria,
    fechaHora: calculo.fechaHora
    };
  }
}

