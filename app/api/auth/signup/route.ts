import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Tất cả trường là bắt buộc' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu không khớp' },
        { status: 400 }
      );
    }

    // Kiểm tra xem email/phone đã tồn tại chưa
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email_or_phone', email || phone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email/Số điện thoại đã được sử dụng' },
        { status: 400 }
      );
    }

    // Tạo user mới trong Supabase
    const userId = Date.now().toString();
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        full_name: name,
        email_or_phone: email || phone,
        password: password, // ⚠️ Trong production nên hash password
        balance: 0,
        vip_level: 0,
        kyc_status: 'Chưa xác minh',
        is_locked: false,
        linked_banks: [],
        transaction_history: [],
        notifications: [],
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Lỗi khi tạo tài khoản: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: userId,
        name: name,
        email: email || phone,
        phone: phone,
        balance: 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
