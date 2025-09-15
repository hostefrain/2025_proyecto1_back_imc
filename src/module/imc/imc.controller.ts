import { Controller, Post, Body, ValidationPipe, Get } from '@nestjs/common';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { CrearImcDto } from './dto/crear-imc-dto';


@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Get()
  test(): string {
    return 'IMC Controller está funcionando correctamente!';
  }

  @Post('calcular')
  async calcular(@Body(ValidationPipe) data: CalcularImcDto): Promise<CrearImcDto> {
    return await this.imcService.createImc(data);
  }
}
