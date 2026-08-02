// src/faq/faq.controller.ts
// Owner-side endpoints for FAQ knowledge management
import {
  Controller,
  Put,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FaqService } from './faq.service';
import { ToggleFaqDto } from './dto/toggle-faq.dto';
import { UploadTextDocsDto } from './dto/upload-text-docs.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';
import { CompanyResource } from 'src/company/resources/company.resource';

@ApiTags('FAQ')
@ApiBearerAuth('access-token')
@Controller('faq')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.CompanyOwner)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  /**
   * Toggle the FAQ feature on or off for the owner's company.
   * On first enable: auto-registers company with external FAQ provider.
   * PUT /faq/toggle-active
   */
  @Put('toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable/disable the FAQ feature for the company' })
  async toggleActive(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: ToggleFaqDto,
  ) {
    const company = await this.faqService.toggleActive(user, dto.isActive);
    const transformed = CompanyResource.transformCompany(company);
    // Strip sensitive provider token from response
    delete transformed.faqApiKey;
    delete transformed.faqExternalCompanyId;
    return ResponseUtil.success(
      'FAQ feature updated successfully.',
      transformed,
    );
  }

  /**
   * Upload a text knowledge document.
   * POST /faq/text-docs
   */
  @Post('text-docs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a text knowledge document' })
  async uploadTextDocs(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: UploadTextDocsDto,
  ) {
    const doc = await this.faqService.uploadTextDocs(
      user,
      dto.title,
      dto.content,
    );
    return ResponseUtil.success('Text document uploaded successfully.', doc);
  }

  /**
   * Upload a PDF knowledge document (multipart/form-data).
   * POST /faq/pdf-docs
   * Body: title (text field), file (PDF binary)
   */
  @Post('pdf-docs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a PDF knowledge document (max 10MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new Error('Only PDF files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadPdfDocs(
    @GetUser() user: AuthenticatedUser,
    @Body('title') title: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return ResponseUtil.success('No file uploaded.', null);
    }
    const doc = await this.faqService.uploadPdfDocs(user, title, file);
    return ResponseUtil.success('PDF document uploaded successfully.', doc);
  }

  /**
   * Get all knowledge documents for the owner's company.
   * GET /faq/docs
   */
  @Get('docs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all knowledge documents for the company' })
  async getDocs(@GetUser() user: AuthenticatedUser) {
    const docs = await this.faqService.getDocs(user);
    return ResponseUtil.success('Documents retrieved successfully.', docs);
  }

  /**
   * Delete a knowledge document by its external provider ID.
   * DELETE /faq/docs/:docsId
   */
  @Delete('docs/:docsId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a knowledge document by its provider ID' })
  async deleteDoc(
    @GetUser() user: AuthenticatedUser,
    @Param('docsId', ParseIntPipe) docsId: number,
  ) {
    await this.faqService.deleteDoc(user, docsId);
    return ResponseUtil.success('Document deleted successfully.');
  }
}
