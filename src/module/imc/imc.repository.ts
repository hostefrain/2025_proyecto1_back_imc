import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImcEntity } from './imc.entity';
import { IImcRepository } from './IImcRepository';

@Injectable()
export class ImcRepository implements IImcRepository {
  constructor(
    @InjectRepository(ImcEntity)
    private readonly ormRepo: Repository<ImcEntity>,
  ) {}

  async save(imc: ImcEntity): Promise<ImcEntity> {
    return this.ormRepo.save(imc);
  }

  async findAll(): Promise<ImcEntity[]> {
    return this.ormRepo.find();
  }
}
