// src/faq/faq-public.controller.ts
// Client-side Ask endpoint — accessible to any logged-in user
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { AskFaqDto } from './dto/ask-faq.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('faq')
export class FaqPublicController {
  constructor(private readonly faqService: FaqService) {}

  /**
   * Ask a question to the company's FAQ chatbot.
   * Any authenticated user can call this endpoint.
   * POST /faq/ask
   */
  @Post('ask')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async ask(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: AskFaqDto,
  ) {
    const result = await this.faqService.ask(
      dto.companyId,
      dto.question,
      user._id.toString(),
    );
    return ResponseUtil.success('Answer retrieved successfully.', result);
  }

  /**
   * Get chatbot history for the current user against a company's knowledge base.
   * GET /faq/:companyId/history
   */
  @Get(':companyId/history')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getHistory(
    @GetUser() user: AuthenticatedUser,
    @Param('companyId') companyId: string,
  ) {
    const result = await this.faqService.getHistory(
      companyId,
      user._id.toString(),
    );
    return ResponseUtil.success('History retrieved successfully.', result);
  }
}
