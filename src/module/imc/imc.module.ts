import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcController } from './imc.controller';
import { ImcService } from './imc.service';
import { ImcEntity } from './imc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImcEntity]),
  ],
  controllers: [ImcController],
  providers: [ImcService],
  exports: [ImcService],
})
export class ImcModule {}