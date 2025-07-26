import { CommonModule } from '@app/common';
import { JwtGuard, RoleGuard } from '@app/common/guards';
import { SessionMiddleware } from '@app/common/middlewares';
import { publicPaths } from '@app/common/utils';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { FriendsModule } from './modules/friends/friends.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PostsModule } from './modules/posts/posts.module';
import { SseModule } from './modules/sse/sse.module';
import { StoriesModule } from './modules/stories/stories.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { PresenceGateway } from './presence.gateway';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommonModule,
    UploadsModule,
    PostsModule,
    FriendsModule,
    ConversationsModule,
    StoriesModule,
    NotificationsModule,
    SseModule,
    BookmarksModule,
    AdminModule,
  ],
  providers: [
    PresenceGateway,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .exclude(
        ...publicPaths,
        {
          path: '/ws/*path',
          method: RequestMethod.ALL,
        },
        {
          path: '/notifications/sse/*path',
          method: RequestMethod.ALL,
        },
      )
      .forRoutes('*');
  }
}
