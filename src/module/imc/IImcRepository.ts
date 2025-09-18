import { ImcEntity } from "./imc.entity";

export interface IImcRepository {
    find(options?: any): Promise<ImcEntity[]>;
    save(imc: ImcEntity): Promise<ImcEntity>;
}