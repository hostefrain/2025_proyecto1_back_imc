import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ImcEntity } from './imc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IImcRepository } from './IImcRepository';
import { CrearImcDto } from './dto/crear-imc-dto';

@Injectable()
export class ImcRepository implements IImcRepository {

    constructor(
      @InjectRepository(ImcEntity)
      private readonly repository: Repository<ImcEntity>) {}

    find(): Promise<ImcEntity[]> {
      try {

        console.log('Buscando todas las entidades IMC'); // Log para verificar la llamada

        return this.repository.find({
      order: {
        fechaHora: 'DESC' 
      }
    });
      } catch (error) {
        throw new InternalServerErrorException('Error al obtener las entidades IMC', error.message);
      }
    }

    save(imcDto: CrearImcDto): Promise<ImcEntity> {
      try {
        const nuevaEntity = this.repository.create(imcDto);
        console.log('Nueva entidad creada:', nuevaEntity); // Log para verificar la creación

        return this.repository.save(nuevaEntity);
        
      } catch (error) {
        throw new InternalServerErrorException('Error al crear la entidad IMC', error.message);
      }
  }

}