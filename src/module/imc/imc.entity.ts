import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('imc')
export class ImcEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    altura: number;

    @Column()
    peso: number;

    @Column()
    imcValor: number;

    @Column()
    categoria: string;

    @CreateDateColumn()
    fechaHora: Date;
}