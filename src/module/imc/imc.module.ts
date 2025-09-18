import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcController } from './imc.controller';
import { ImcService } from './imc.service';
import { ImcEntity } from './imc.entity';
import { ImcRepository } from './imc.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImcEntity])],
  controllers: [ImcController],
  providers: [ImcService,
    {provide: 'IImcRepository', 
      useClass: ImcRepository}
  ],
  exports: [TypeOrmModule ,ImcService],
})
export class ImcModule {}