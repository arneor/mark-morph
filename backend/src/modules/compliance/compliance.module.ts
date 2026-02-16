import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ComplianceService } from "./compliance.service";
import {
  ComplianceLog,
  ComplianceLogSchema,
} from "./schemas/compliance-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ComplianceLog.name, schema: ComplianceLogSchema },
    ]),
  ],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
