import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    // Tìm user trong Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email_or_phone', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Verify password
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.is_locked) {
      return NextResponse.json(
        { error: '🔒 Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.' },
        { status: 403 }
      );
    }

    // Cập nhật last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email_or_phone,
        name: user.full_name,
        balance: user.balance,
        vipLevel: user.vip_level,
        kycStatus: user.kyc_status
      },
      token: 'token_' + user.id + '_' + Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
