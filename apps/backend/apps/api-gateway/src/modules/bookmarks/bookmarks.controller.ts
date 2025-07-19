import {
  CreateBookMarkDto,
  DeleteBookMarksQueryDto,
  GetBookMarksQueryDto,
} from '@app/common/dtos/bookmarks';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { KeycloakUser } from 'nest-keycloak-connect';
import { BookmarksService } from './bookmarks.service';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookMarksService: BookmarksService) {}

  @Post()
  async createBookmark(
    @Body() createBookMarkDto: CreateBookMarkDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.bookMarksService.createBookmark(email, createBookMarkDto);
  }

  @Get()
  async getBookmarks(
    @KeycloakUser() user: any,
    @Query() getBookmarksQueryDto: GetBookMarksQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.bookMarksService.getBookmarks(email, getBookmarksQueryDto);
  }

  @Delete()
  async deleteBookmarks(
    @KeycloakUser() user: any,
    @Query() deleteBookMarksQueryDto: DeleteBookMarksQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.bookMarksService.deleteBookmarks(
      email,
      deleteBookMarksQueryDto,
    );
  }
}
