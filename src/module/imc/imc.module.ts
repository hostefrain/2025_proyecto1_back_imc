import { Module } from '@nestjs/common';
import { ImcService } from './imc.service';
import { ImcController } from './imc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcEntity } from './imc.entity';
import { ImcRepository } from './imc.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ImcEntity]),],
  controllers: [ImcController],
  providers: [ImcService],
  exports: [ImcService]
})
export class ImcModule {}