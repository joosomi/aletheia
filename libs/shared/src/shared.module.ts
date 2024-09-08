import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from './database/database.module';

import { SharedService } from './shared.service';

@Module({
  providers: [SharedService],
  exports: [SharedService],
  imports: [SharedDatabaseModule],
})
export class SharedModule {}
