import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';

@Entity('imc')
export class ImcEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  peso: number;

  @Column()
  altura: number;

  @Column()
  imc: number;

  @Column()
  categoria: string;

  @CreateDateColumn()
  fechaHora: Date;
}

