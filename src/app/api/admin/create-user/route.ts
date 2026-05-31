import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { full_name, email, password, phone, school, city } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    /* ── 1. Create Supabase auth user ──────────────────────── */
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "student" },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    /* ── 2. Upsert profile ─────────────────────────────────── */
    await supabaseAdmin.from("profiles").upsert({
      id: authData.user.id,
      email,
      full_name,
      role: "student",
      phone: phone ?? null,
      school: school ?? null,
      city: city ?? null,
    });

    /* ── 3. Send welcome email via Gmail SMTP ──────────────── */
    let emailSent = false;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });

        await transporter.sendMail({
          from: `"BAII — Bharat Advanced Innovation Incubator" <${gmailUser}>`,
          to: email,
          subject: "Welcome to BAII — Your Login Credentials",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f3c 0%,#1a3a6b 100%);padding:36px 40px;text-align:center;">
            <img src="https://baii.in/baii-logo.svg" alt="BAII" width="72" style="margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Welcome to BAII</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Bharat Advanced Innovation Incubator</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#1a3a6b;font-weight:600;">Hi ${full_name},</p>
            <p style="margin:0 0 24px;font-size:14px;color:#4a5568;line-height:1.7;">
              Your student account on the BAII Learning Portal has been created. Use the credentials below to sign in and begin your journey.
            </p>

            <!-- Credentials box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:0.08em;">Login URL</p>
                  <a href="https://baii.in/lms" style="font-size:15px;color:#c47d2a;font-weight:700;text-decoration:none;">baii.in/lms</a>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
                  <p style="margin:0;font-size:14px;color:#1a3a6b;font-weight:600;">${email}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:0.08em;">Password</p>
                  <p style="margin:0;display:inline-block;font-family:'Courier New',monospace;font-size:17px;font-weight:700;color:#1a3a6b;background:#edf2f7;padding:8px 14px;border-radius:6px;letter-spacing:0.08em;">${password}</p>
                </td>
              </tr>
            </table>

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="https://baii.in/lms"
                     style="display:inline-block;background:linear-gradient(135deg,#1a3a6b,#235098);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.03em;">
                    Sign In to Portal →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#a0aec0;line-height:1.6;">
              Please change your password after your first login. If you need any help, reach out to your BAII coordinator.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f9fc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#a0aec0;">© 2025 Bharat Advanced Innovation Incubator · Bengaluru, India</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
          `,
        });

        emailSent = true;
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Non-fatal — user was still created successfully
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      credentials: { email, password, full_name },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
