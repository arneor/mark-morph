import { Module, Global } from "@nestjs/common";
import { S3Service } from "./s3.service";

@Global() // Make it global so BusinessModule can use it easily without import juggling
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class MediaModule {}
