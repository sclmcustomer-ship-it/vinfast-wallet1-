import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, account } = body;

    // Demo validation
    if (!amount || !account) {
      return NextResponse.json(
        { error: 'Thông tin không đầy đủ' },
        { status: 400 }
      );
    }

    const withdrawAmount = parseInt(amount);
    if (withdrawAmount < 50000) {
      return NextResponse.json(
        { error: 'Số tiền rút tối thiểu là 50.000 VNĐ' },
        { status: 400 }
      );
    }

    // Demo response
    return NextResponse.json({
      success: true,
      message: 'Yêu cầu rút tiền đã được gửi',
      transaction: {
        id: 'WTH_' + Date.now(),
        amount: withdrawAmount,
        account: account,
        status: 'pending',
        fee: 5000,
        netAmount: withdrawAmount - 5000,
        estimatedTime: '1-3 ngày làm việc',
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
