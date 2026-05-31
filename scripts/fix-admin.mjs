import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const sb = createClient(
  "https://xaiwavwpptbiphfklcgw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaXdhdndwcHRiaXBoZmtsY2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIzOTUxNiwiZXhwIjoyMDk1ODE1NTE2fQ.EgK2XsQxu8nywZovoqSmVZgSXp7mHF68pmVWmqiQPwo",
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } }
);

const EMAIL = "vvkz.1818@gmail.com";

// 1. Get user from auth
const { data: list } = await sb.auth.admin.listUsers();
const user = list.users.find(u => u.email === EMAIL);

if (!user) { console.error("User not found"); process.exit(1); }

console.log("User ID:", user.id);
console.log("User metadata:", user.user_metadata);

// 2. Update user_metadata to include role=admin
const { error: metaErr } = await sb.auth.admin.updateUserById(user.id, {
  user_metadata: { ...user.user_metadata, role: "admin", full_name: "BAII Admin" }
});
if (metaErr) console.error("Metadata update error:", metaErr.message);
else console.log("✓ user_metadata.role set to admin");

// 3. Upsert profile
const { error: profileErr } = await sb.from("profiles").upsert({
  id: user.id, email: EMAIL, full_name: "BAII Admin", role: "admin"
}, { onConflict: "id" });
if (profileErr) console.error("Profile error:", profileErr.message);
else console.log("✓ profiles.role confirmed as admin");

console.log("\nDone. Login at baii.in/lms with your password.");
