import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportOptionsDto } from './dto/import-options.dto';
import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file?: Express.Multer.File,
    @Body('category') category?: string,
    @Body('year') year?: string,
  ) {
    if (!file) {
      return { inserted: 0, skipped: 0, error: 'Aucun fichier fourni.' };
    }

    const options: ImportOptionsDto = { category, year };
    return this.importService.importBuffer(file.buffer, file.originalname, options);
  }
}
