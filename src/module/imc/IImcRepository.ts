import { ImcEntity } from './imc.entity';

export interface IImcRepository {
  save(imc: ImcEntity): Promise<ImcEntity>;
  findAll(): Promise<ImcEntity[]>;
}
