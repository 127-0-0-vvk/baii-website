import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { full_name, email, password, phone, school, city } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    // Create auth user via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "student" },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Upsert profile with extra fields
    await supabaseAdmin.from("profiles").upsert({
      id: authData.user.id,
      email,
      full_name,
      role: "student",
      phone: phone ?? null,
      school: school ?? null,
      city: city ?? null,
    });

    // Send credentials email via Resend
    await resend.emails.send({
      from: "BAII <noreply@baii.in>",
      to: email,
      subject: "Your BAII Learning Portal Credentials",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0d1f3c;color:#fff;padding:32px;border-radius:16px;">
          <img src="https://baii.in/baii-logo.svg" alt="BAII" style="width:60px;margin-bottom:20px;" />
          <h2 style="color:#c47d2a;margin:0 0 8px">Welcome to BAII, ${full_name}!</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin:0 0 24px">
            Your student account has been created. Use the credentials below to log in to your learning portal.
          </p>
          <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);">Login URL</p>
            <a href="https://baii.in/lms" style="color:#c47d2a;font-weight:600;">baii.in/lms</a>
            <p style="margin:16px 0 4px;font-size:13px;color:rgba(255,255,255,0.5);">Email</p>
            <p style="margin:0;font-weight:600;">${email}</p>
            <p style="margin:16px 0 4px;font-size:13px;color:rgba(255,255,255,0.5);">Password</p>
            <p style="margin:0;font-weight:600;font-family:monospace;background:rgba(0,0,0,0.3);padding:8px 12px;border-radius:6px;">${password}</p>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;">Please change your password after first login. For help, contact your BAII coordinator.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
