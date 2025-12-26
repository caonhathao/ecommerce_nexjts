import { NextRequest } from 'next/server';
import { createOrder } from '@/app/actions/order';
import { ResponseFactory } from '@/lib/api-response';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { createCheckoutRequestUseCase } from '@/features/payment/payment.usecases';
import { prisma } from '@/lib/db';
import { $Enums } from '@/lib/generated/prisma';
import PaymentProvider = $Enums.PaymentProvider;
import PaymentStatus = $Enums.PaymentStatus;
import Currency = $Enums.Currency;
import { createPaymentIntentService } from '@/features/payment/services/payment_intent.service';
import IntentStatus = $Enums.IntentStatus;
import { ServiceError } from '@/lib/service-error';
import { Decimal } from '@/lib/generated/prisma/runtime/client';

export async function POST(req: NextRequest) {
  try {
    const bodyJson = await req.json();
    const { draftId } = bodyJson;

    console.log(
      `[MOMO-DEBUG] --- Bắt đầu tạo thanh toán cho Draft: ${draftId} ---`
    );
    const result = await createOrder(draftId);

    if (!result.success) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({ message: result.error, code: 400 })
      );
    }

    const orderList = result.order;

    if (orderList.some((o) => o.paymentStatus === 'PAID')) {
      console.warn('--- [VNPAY-DEBUG] Order already PAID');
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'Đơn hàng đã được thanh toán',
          code: 400,
        })
      );
    }
    const orderIds = Array.from(orderList, (item) => item.id);
    const amountMOMO = orderList.reduce(
      (total, item) => total.plus(item.grandTotal),
      new Decimal(0)
    );

    const date = new Date();

    //MOMO Infor
    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;
    const requestId = v4();
    const orderId = `${draftId}_${date.getTime()}`;
    const orderInfo = `Thanh_toan_don_hang_qua_MOMO`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL!}success`;
    const ipnUrl = `${process.env.NEXT_PUBLIC_BASE_URL!}api/checkout/momo/ipn`;
    const requestType = 'captureWallet';
    const extraData = '';
    //Buffer.from(JSON.stringify(data)).toString('base64');

    const amount = Number(amountMOMO);
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');
    const lang = 'en';
    const autoCapture = true;

    console.log('[MOMO-DEBUG] 1. Kiểm tra tham số:');
    console.log(`- Amount (Integer): ${amount}`);
    console.log(`- OrderId: ${orderId} (Length: ${orderId.length})`); // Phải < 50
    console.log(`- RedirectUrl: ${redirectUrl}`);
    console.log(`- IpnUrl: ${ipnUrl}`);
    console.log(`- ExtraData: '${extraData}'`);

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    console.log('[MOMO-DEBUG] 2. Chuỗi Raw Signature:');
    console.log(rawSignature);

    const hashSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    console.log(`[MOMO-DEBUG] 3. Hash Signature: ${hashSignature}`);

    await createCheckoutRequestUseCase(prisma, {
      params: {
        provider: PaymentProvider.MOMO,
        method: 'QR',
        amount: amount,
        status: PaymentStatus.PENDING,
        currency: Currency.VND,
        externalId: orderId,
        rawPayload: {
          provider: 'MOMO',
          orderId,
          amount,
          orderInfo,
          requestType,
          requestId,
          orderIds,
          draftId,
        },
      },
      orderList: orderIds,
    });

    const expiresAt = dayjs().add(15, 'minute').toDate();
    await createPaymentIntentService(prisma, {
      gatewayRef: orderId,
      provider: PaymentProvider.MOMO,
      orderIds: { orderIds: orderIds },
      status: IntentStatus.ACTIVE,
      amount: new Decimal(amount),
      expiresAt: expiresAt,
    });

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      signature: hashSignature,
    });

    console.log('[MOMO-DEBUG] 4. Gửi Request sang MoMo:', requestBody);

    const momoRes = await fetch(process.env.MOMO_API_END_POINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });

    const momoData = await momoRes.json();

    console.log(
      '[MOMO-DEBUG] 5. Kết quả từ MoMo:',
      JSON.stringify(momoData, null, 2)
    );

    if (momoData.resultCode !== 0) {
      console.error('[MOMO-DEBUG] ❌ THẤT BẠI: resultCode khác 0');
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: momoData.message || 'MoMo create payment failed',
          code: 400,
        })
      );
    }

    console.log('[MOMO-DEBUG] ✅ THÀNH CÔNG: Đã nhận payUrl');
    return ResponseFactory.toNextResponse(
      ResponseFactory.success({
        data: { url: momoData.payUrl },
        code: 200,
      })
    );
  } catch (error) {
    console.error(error);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error({
        message:
          error instanceof ServiceError
            ? error.message
            : 'Internal Server Error',
        code: 500,
      })
    );
  }
}
