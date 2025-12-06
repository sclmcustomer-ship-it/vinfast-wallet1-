import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account, amount, method, bank } = body;

    // Demo validation
    if (!account || !amount || !method) {
      return NextResponse.json(
        { error: 'Thông tin không đầy đủ' },
        { status: 400 }
      );
    }

    const depositAmount = parseInt(amount);
    if (depositAmount < 10000 || depositAmount > 100000000) {
      return NextResponse.json(
        { error: 'Số tiền không hợp lệ (10.000 - 100.000.000 VNĐ)' },
        { status: 400 }
      );
    }

    // Demo response
    return NextResponse.json({
      success: true,
      message: 'Yêu cầu nạp tiền đã được gửi',
      transaction: {
        id: 'TRX_' + Date.now(),
        amount: depositAmount,
        method: method,
        bank: bank,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
