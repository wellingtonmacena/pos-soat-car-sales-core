import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PaymentOrderModule } from './payment_order/payment_order.module';

@Module({
  imports: [UsersModule, PaymentOrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
