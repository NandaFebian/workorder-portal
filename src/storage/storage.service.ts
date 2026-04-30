import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  
  // Dalam aplikasi nyata, pindahkan konfigurasi ini ke .env
  private bucketName = process.env.MINIO_BUCKET_NAME || 'workorder';

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1', // Region ini biasanya wajib untuk AWS SDK walaupun pakai MinIO
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true, // PENTING: Wajib true agar MinIO bisa mendeteksi path bucket
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileExtension = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Kembalikan URL untuk bisa diakses langsung (asumsi bucket disetting Public di MinIO)
      const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
      return `${endpoint}/${this.bucketName}/${fileName}`;
      
    } catch (error) {
      console.error('Error saat upload ke MinIO:', error);
      throw new InternalServerErrorException('Gagal mengunggah file ke server MinIO');
    }
  }
}
