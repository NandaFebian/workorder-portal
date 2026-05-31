import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);

  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>('MINIO_BUCKET_NAME') || 'workorder';

    const endpoint =
      this.configService.get<string>('MINIO_PRIVATE_ENDPOINT') ||
      this.configService.get<string>('MINIO_ENDPOINT') ||
      'http://localhost:9000';

    this.logger.log(`Initializing MinIO with endpoint: ${endpoint}`);

    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: endpoint,
      credentials: {
        accessKeyId:
          this.configService.get<string>('MINIO_ROOT_USER') ||
          this.configService.get<string>('MINIO_ACCESS_KEY') ||
          'minioadmin',
        secretAccessKey:
          this.configService.get<string>('MINIO_ROOT_PASSWORD') ||
          this.configService.get<string>('MINIO_SECRET_KEY') ||
          'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    // Ubah ekstensi menjadi .webp secara seragam untuk efisiensi tinggi
    const fileName = `${uuidv4()}.webp`;

    try {
      // Proses optimasi gambar: Resize & Konversi ke WebP
      const optimizedBuffer = await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Lebar maksimal 1200px (tidak diperbesar jika aslinya kecil)
        .webp({ effort: 6, quality: 80 }) // Format WebP sangat ringan dan tetap tajam (kualitas 80%)
        .toBuffer();

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
      });

      await this.s3Client.send(command);

      // Kembalikan URL untuk bisa diakses langsung (asumsi bucket disetting Public di MinIO)
      const publicEndpoint =
        this.configService.get<string>('MINIO_PUBLIC_ENDPOINT') ||
        this.configService.get<string>('MINIO_ENDPOINT') ||
        'http://localhost:9000';
      return `${publicEndpoint}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error saat upload ke MinIO:', error);
      throw new InternalServerErrorException(
        'Gagal mengunggah file ke server MinIO',
      );
    }
  }
}
