import { NextRequest } from 'next/server';
import { ServiceError } from '@/lib/service-error';
import { createOrder } from '@/app/actions/order';
import { ResponseFactory } from '@/lib/api-response';
import dayjs from 'dayjs';
import { Decimal } from '@prisma/client/runtime/library';
import qs from 'qs';
import crypto from 'crypto';
import {
  createPaymentIntentService,
  createPaymentService,
  getPaymentIntentByTxnRefService,
} from '@/features/payment/payment.service';
import { prisma } from '@/lib/db';

function sortObject(
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
};

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
    const amountVNPay = orderList.reduce(
      (total, order) => total.plus(order.grandTotal),
      new Decimal(0)
    );

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    // VNPay payment integration is not implemented yet
    const ipAddr =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

    const tmnCode = process.env.VNPAY_TERMINAL_ID!;
    const secretKey = process.env.VNPAY_SECRET_KEY!;
    let vnpUrl = process.env.VNPAY_URL!;
    const returnUrl = process.env.VNPAY_RETURN_URL!;

    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');
    const TxnRef = `${draftId}${date}${random}`;
    const amount = Number(amountVNPay);
    const bankCode = body.bankCode;
    const orderInfo = `Thanh toan don hang: ${orderList
      .map((o) => o.id)
      .join(',')}`;
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

    const payment = await createPaymentService({
      provider: 'VNPAY',
      method: bankCode,
      amount: amount,
      status: 'PENDING',
      currency: 'VND',
      externalId: TxnRef,
    });

    if (!payment) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('Failed to create payment record')
      );
    }

    const expiresAt = dayjs().add(15, 'minute').toDate();
    await createPaymentIntentService({
      vnpTxnRef: TxnRef,
      payload: { orderIds: orderList.map((o) => o.id) },
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let vnp_Params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      vnp_Params[key] = value;
    }

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_SECRET_KEY!;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const TxnRef = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];

      const paymentIntent = await getPaymentIntentByTxnRefService(TxnRef);
      const payload = paymentIntent?.payload as PaymentIntentPayload | null;
      const orderIds = payload?.orderIds ?? [];

      await prisma.payment.updateMany({
        where: { externalId: TxnRef, provider: 'VNPAY' },
        data: { status: 'PAID', updatedAt: new Date() },
      });

      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          updatedAt: new Date(),
        },
      });

      return ResponseFactory.toNextResponse(
        ResponseFactory.success({ RspCode: rspCode, Message: 'success' })
      );
    } else {
      return ResponseFactory.toNextResponse(
        ResponseFactory.success({ RspCode: '97', Message: 'Fail checksum' })
      );
    }
  } catch (error) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        error instanceof ServiceError ? error.message : 'Internal Server Error',
        500
      )
    );
  }
}
