import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@Controller('files')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // File di-intercept dan disimpan di Memory/RAM sebagai buffer
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // Batas maksimal 5MB
          new FileTypeValidator({ fileType: 'image' }), // Menerima semua tipe file gambar (image/*)
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Teruskan buffer ke Service untuk di-upload ke MinIO
    const fileUrl = await this.storageService.uploadImage(file);

    return {
      success: true,
      message: 'File gambar berhasil diunggah',
      data: {
        url: fileUrl,
      },
    };
  }
}
