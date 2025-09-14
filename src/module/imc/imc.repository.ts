import { Repository, DataSource, Between } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImcEntity } from './imc.entity';

@Injectable()
export class ImcRepository {

    private repository: Repository<ImcEntity>;

    constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(ImcEntity);
  }

    async save(Imc: ImcEntity): Promise<ImcEntity> {
    try {
      return await this.repository.save(Imc);

    } catch (error) {
      throw new Error(`Error al guardar el cálculo de IMC: ${error}`);
    }
  }

}