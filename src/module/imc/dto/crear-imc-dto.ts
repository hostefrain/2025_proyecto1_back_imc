import { IsDate, IsNumber, IsString, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CrearImcDto {

  @IsNumber()  
  id: ObjectId;

  @IsNumber()
  @Min(0.1) // Altura mínima razonable
  altura: number;

  @IsNumber()
  @Min(1) // Peso mínimo razonable
  peso: number;
  
  @IsNumber()
  imcValor: number;

  @IsString()
  categoria: string;

  @IsDate()
  fechaHora: Date;
}