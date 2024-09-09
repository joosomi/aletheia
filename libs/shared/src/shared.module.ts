import { Module } from '@nestjs/common';

import { SharedDatabaseModule } from './database/database.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { SharedService } from './shared.service';

@Module({
  imports: [SharedDatabaseModule],
  providers: [SharedService, GlobalExceptionFilter],
  exports: [SharedService],
})
export class SharedModule {}
