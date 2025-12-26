import { NextRequest, NextResponse } from 'next/server';
import { ServiceError } from '@/lib/service-error';
import { createOrder } from '@/app/actions/order';
import { ResponseFactory } from '@/lib/api-response';
import dayjs from 'dayjs';
import qs from 'qs';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { customerPaidOrderSuccessUsecase } from '@/features/payment_transaction/payment_transaction.usecases';
import { createCheckoutRequestUseCase } from '@/features/payment/payment.usecases';
import { $Enums } from '@/lib/generated/prisma';
import PaymentProvider = $Enums.PaymentProvider;
import PaymentStatus = $Enums.PaymentStatus;
import Currency = $Enums.Currency;
import { createPaymentIntentService } from '@/features/payment/services/payment_intent.service';
import IntentStatus = $Enums.IntentStatus;
import { Decimal } from '@/lib/generated/prisma/runtime/client';

export function sortObject(
  obj: Record<string, string | number>
): Record<string, string> {
  const sorted: Record<string, string> = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = encodeURIComponent(String(obj[key]));
    });

  return sorted;
}

export async function POST(req: NextRequest) {
  // [DEBUG] 1. Bắt đầu request
  console.log('--- [VNPAY-DEBUG] START POST REQUEST ---');

  try {
    const bodyJson = await req.json();
    const { draftId, body } = bodyJson;

    // [DEBUG] 2. Check input
    console.log('--- [VNPAY-DEBUG] Input received:', {
      draftId,
      bankCode: body?.bankCode,
    });

    const result = await createOrder(draftId);

    // [DEBUG] 3. Check createOrder result
    console.log('--- [VNPAY-DEBUG] createOrder success:', result.success);

    if (!result.success) {
      console.error('--- [VNPAY-DEBUG] createOrder Failed:', result.error);
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
    const amountVNPay = orderList.reduce(
      (total, order) => total.plus(order.grandTotal),
      new Decimal(0)
    );
    console.log('--- [VNPAY-DEBUG] Amount calculated:', amountVNPay.toString());

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    // [DEBUG] 4. Check Environment Variables (Rất hay lỗi ở đây)
    const tmnCode = process.env.VNPAY_TERMINAL_ID!;
    const secretKey = process.env.VNPAY_SECRET_KEY!;
    let vnpUrl = process.env.VNPAY_URL!;
    const returnUrl = process.env.VNPAY_RETURN_URL!;

    console.log('--- [VNPAY-DEBUG] ENV Check:', {
      HasTmnCode: !!tmnCode,
      HasSecretKey: !!secretKey, // Không log giá trị thật để bảo mật
      vnpUrl: vnpUrl,
      returnUrl: returnUrl,
    });

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      throw new Error(
        'MISSING ENV VARIABLES (VNPAY_TERMINAL_ID, VNPAY_SECRET_KEY...)'
      );
    }

    // VNPay payment integration is not implemented yet
    const ipAddr =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');
    const TxnRef = `${draftId}_${date.getTime()}_${random}`;
    const amount = Number(amountVNPay);
    const bankCode = body.bankCode;
    const orderInfo = `Thanh_toan_don_hang_qua_VNPAY`;
    const orderType = '200000';
    const locale = body.language || 'vn';
    const currency = 'VND';
    let vnp_Params: Record<string, string | number> = {};

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currency;
    vnp_Params['vnp_TxnRef'] = TxnRef;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // [DEBUG] 5. Trước khi gọi sortObject
    console.log('--- [VNPAY-DEBUG] Params prepared. Calling sortObject...');
    // Lưu ý: Nếu hàm sortObject chưa import hoặc chưa khai báo, nó sẽ Crash tại đây
    vnp_Params = sortObject(vnp_Params);

    // [DEBUG] 6. Tạo Hash
    console.log('--- [VNPAY-DEBUG] sortObject done. Creating Hash...');
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    vnp_Params['vnp_SecureHash'] = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    // [DEBUG] 7. Lưu DB
    console.log('--- [VNPAY-DEBUG] Hash done. Saving to DB...');

    await createCheckoutRequestUseCase(prisma, {
      params: {
        provider: PaymentProvider.VNPAY,
        method: 'CARD',
        amount: amount,
        status: PaymentStatus.PENDING,
        currency: Currency.VND,
        externalId: TxnRef,
        rawPayload: {
          provider: 'VNPAY',
          vnp_TxnRef: TxnRef,
          vnp_Amount: amount * 100,
          vnp_OrderInfo: orderInfo,
          vnp_OrderType: orderType,
          vnp_TmnCode: tmnCode,
          vnp_CurrCode: 'VND',
          vnp_Locale: locale,
          vnp_IpAddr: ipAddr,
          vnp_BankCode: bankCode,
          vnp_CreateDate: createDate,
          vnp_ReturnUrl: returnUrl,

          orderIds: orderIds,
          draftId,
        },
      },
      orderList: orderIds,
    });

    console.log(
      '--- [VNPAY-DEBUG] Saved CheckoutRequest. Saving PaymentIntent...'
    );

    const expiresAt = dayjs().add(15, 'minute').toDate();
    await createPaymentIntentService(prisma, {
      gatewayRef: TxnRef,
      provider: PaymentProvider.VNPAY,
      orderIds: { orderIds: orderIds },
      status: IntentStatus.ACTIVE,
      amount: new Decimal(amount),
      expiresAt: expiresAt,
    });

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    console.log('--- [VNPAY-DEBUG] SUCCESS. URL created:', vnpUrl);

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({ data: { url: vnpUrl } })
    );
  } catch (error: any) {
    // [DEBUG] CATCH BLOCK - QUAN TRỌNG NHẤT
    console.error('--- [VNPAY-DEBUG] CRITICAL ERROR 500 ---');
    console.error('Message:', error.message);
    console.error('Stack Trace:', error.stack); // Xem dòng nào gây lỗi ở đây

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
//Get webhook
export async function GET(req: NextRequest) {
  console.log('--- [IPN-DEBUG] START IPN HANDLER ---');
  try {
    const searchParams = req.nextUrl.searchParams;
    const vnp_Params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      vnp_Params[key] = value;
    }

    const secureHash = vnp_Params['vnp_SecureHash'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef'];

    console.log('[IPN-DEBUG] Received Params:', {
      rspCode,
      txnRef,
      secureHash,
    });

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys
      .map((key) => {
        return `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`;
      })
      .join('&');

    // vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_SECRET_KEY!;
    // const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log('[IPN-DEBUG] Checksum Verify:', {
      MySign: signed,
      VnpSign: secureHash,
      Match: signed === secureHash,
    });

    if (secureHash !== signed) {
      console.error('[IPN-DEBUG] ❌ Checksum Failed!');
      return NextResponse.json({ RspCode: '97', Message: 'Fail checksum' });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        externalId: txnRef,
        provider: 'VNPAY',
      },
      include: {
        orders: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
    }

    if (payment.status === 'PAID' && rspCode === '00') {
      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    }

    if (payment.status === 'FAILED' && rspCode === '00') {
      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    }

    const orderDetails = payment.orders.map((op) => op.order);
    const orderIds = orderDetails.map((o) => o.id);

    if (rspCode === '00') {
      await prisma.$transaction(async (tx) => {
        // A. Update Payment Status
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', updatedAt: new Date() },
        });

        // B. Update Order Status
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            updatedAt: new Date(),
          },
        });

        await tx.paymentIntent.update({
          where: { gatewayRef: txnRef },
          data: {
            status: 'SUCCEEDED',
          },
        });

        for (const order of orderDetails) {
          try {
            await customerPaidOrderSuccessUsecase(
              order.shopId!,
              order.grandTotal,
              order.id,
              payment.id
            );
          } catch (e) {
            console.error(`Lỗi cộng tiền ví cho order ${order}:`, e);
          }
        }
      });

      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', updatedAt: new Date() },
        });
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: { paymentStatus: 'FAILED', updatedAt: new Date() },
        });

        await tx.paymentIntent.update({
          where: { gatewayRef: txnRef },
          data: {
            status: 'FAILED',
          },
        });
      });

      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    }
  } catch (error) {
    return NextResponse.json({
      RspCode: '99',
      Message: 'Unknown Error' + error,
    });
  }
}
