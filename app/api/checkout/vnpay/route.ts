import { NextRequest, NextResponse } from 'next/server';
import { ServiceError } from '@/lib/service-error';
import { createOrder } from '@/app/actions/order';
import { ResponseFactory } from '@/lib/api-response';
import dayjs from 'dayjs';
import { Decimal } from '@prisma/client/runtime/library';
import qs from 'qs';
import crypto from 'crypto';
import { createPaymentService } from '@/features/payment/services/payment.service';
import { prisma } from '@/lib/db';
import { customerPaidOrderSuccessUsecase } from '@/features/payment_transaction/payment_transaction.usecases';
import { createCheckoutRequestUseCase } from '@/features/payment/payment.usecases';
import { $Enums } from '@/lib/generated/prisma';
import PaymentProvider = $Enums.PaymentProvider;
import PaymentStatus = $Enums.PaymentStatus;
import Currency = $Enums.Currency;
import { createPaymentIntentService } from '@/features/payment/services/payment_intent.service';
import IntentStatus = $Enums.IntentStatus;

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

type PaymentIntentPayload = {
  orderIds: string[];
  paymentId: string;
};
//Send vnpay request
export async function POST(req: NextRequest) {
  try {
    const { draftId, body } = await req.json();

    const result = await createOrder(draftId);
    if (!result.success) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error(result.error, 400)
      );
    }

    const orderList = result.order;

    if (orderList.some((o) => o.paymentStatus === 'PAID')) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('Đơn hàng đã được thanh toán', 400)
      );
    }

    const orderIds = Array.from(orderList, (item) => item.id);
    const amountVNPay = orderList.reduce(
      (total, order) => total.plus(order.grandTotal),
      new Decimal(0)
    );

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    // VNPay payment integration is not implemented yet
    const ipAddr =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    const tmnCode = process.env.VNPAY_TERMINAL_ID!;
    const secretKey = process.env.VNPAY_SECRET_KEY!;
    let vnpUrl = process.env.VNPAY_URL!;
    const returnUrl = process.env.VNPAY_RETURN_URL!;

    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');
    const TxnRef = `${draftId}${date}${random}`;
    const amount = Number(amountVNPay);
    const bankCode = body.bankCode;
    const orderInfo = `Thanh toan don hang qua VNPAY`;
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
    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    vnp_Params['vnp_SecureHash'] = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

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

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({ url: vnpUrl })
    );
  } catch (error) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        error instanceof ServiceError ? error.message : 'Internal Server Error',
        500
      )
    );
  }
}

//Get webhook
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let vnp_Params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      vnp_Params[key] = value;
    }

    const secureHash = vnp_Params['vnp_SecureHash'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_SECRET_KEY!;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
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
