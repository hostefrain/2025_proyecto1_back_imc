import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('imc_entity')
export class ImcEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 5, scale: 2 })
    altura: number;

    @Column('decimal', { precision: 5, scale: 2 })
    peso: number;

    @Column('decimal', { precision: 5, scale: 2 })
    imcValor: number;

    @Column('varchar', { length: 50 })
    categoria: string;

    @CreateDateColumn()
    fechaHora: Date;
}