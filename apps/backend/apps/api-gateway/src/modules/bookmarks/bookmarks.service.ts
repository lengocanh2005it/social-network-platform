import {
  CreateBookMarkDto,
  DeleteBookMarksQueryDto,
  GetBookMarksQueryDto,
} from '@app/common/dtos/bookmarks';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class BookmarksService implements OnModuleInit {
  constructor(
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = ['create-bookmark', 'get-bookmarks', 'delete-bookmarks'];
    patterns.forEach((p) => this.postsClient.subscribeToResponseOf(p));
  }

  public createBookmark = async (
    email: string,
    createBookMarkDto: CreateBookMarkDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'create-bookmark', {
      email,
      createBookMarkDto: toPlain(createBookMarkDto),
    });
  };

  public getBookmarks = async (
    email: string,
    getBookMarksQueryDto: GetBookMarksQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-bookmarks', {
      email,
      getBookMarksQueryDto: toPlain(getBookMarksQueryDto),
    });
  };

  public deleteBookmarks = async (
    email: string,
    deleteBookMarksQueryDto: DeleteBookMarksQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'delete-bookmarks', {
      email,
      deleteBookMarksQueryDto: toPlain(deleteBookMarksQueryDto),
    });
  };
}
