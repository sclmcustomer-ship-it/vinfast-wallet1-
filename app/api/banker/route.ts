import { NextResponse } from 'next/server';

export async function GET() {
  // Demo banker list
  const bankers = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      zalo: '0912345678',
      commission: '2-3%',
      status: 'active'
    },
    {
      id: '2',
      name: 'Trần Thị B',
      phone: '0987654321',
      zalo: '0987654321',
      commission: '1.5-2.5%',
      status: 'active'
    },
    {
      id: '3',
      name: 'Lê Văn C',
      phone: '0966666666',
      zalo: '0966666666',
      commission: '2-3%',
      status: 'active'
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      phone: '0955555555',
      zalo: '0955555555',
      commission: '1.5-2.5%',
      status: 'active'
    }
  ];

  return NextResponse.json({
    success: true,
    data: bankers
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankerId } = body;

    if (!bankerId) {
      return NextResponse.json(
        { error: 'Banker ID không hợp lệ' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã chọn Banker thành công',
      bunkerId: bankerId
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
