// Run once: node scripts/setup.mjs
// Sets up all Supabase tables and creates the admin account.

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const SUPABASE_URL = "https://xaiwavwpptbiphfklcgw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaXdhdndwcHRiaXBoZmtsY2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIzOTUxNiwiZXhwIjoyMDk1ODE1NTE2fQ.EgK2XsQxu8nywZovoqSmVZgSXp7mHF68pmVWmqiQPwo";

const ADMIN_EMAIL    = "vvkz.1818@gmail.com";
const ADMIN_PASSWORD = "BAII@Admin2025";
const ADMIN_NAME     = "BAII Admin";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

/* ── 1. Run schema via Management REST API ─────────────────────── */
async function runSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/xaiwavwpptbiphfklcgw/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Management API needs a personal access token — skip DDL via API,
        // use supabase-js for DML instead.
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  return res.json();
}

/* ── 2. Create admin user ──────────────────────────────────────── */
async function createAdmin() {
  console.log("Creating admin user…");
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME, role: "admin" },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log("Admin user already exists — skipping.");
      // Fetch existing user to get ID
      const { data: list } = await supabase.auth.admin.listUsers();
      return list.users.find((u) => u.email === ADMIN_EMAIL);
    }
    throw error;
  }
  console.log("✓ Admin auth user created:", data.user.id);
  return data.user;
}

/* ── 3. Upsert profile as admin ────────────────────────────────── */
async function setAdminProfile(user) {
  console.log("Setting admin profile…");
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: ADMIN_EMAIL,
    full_name: ADMIN_NAME,
    role: "admin",
  });
  if (error) throw error;
  console.log("✓ Admin profile set with role=admin");
}

/* ── 4. Seed courses ───────────────────────────────────────────── */
async function seedCourses() {
  console.log("Seeding courses…");
  const courses = [
    { code: "ETF",  title: "Energy Foundation",              track: "energy",        description: "Core fundamentals of energy science. Mandatory starting point.",              prerequisite_code: null,  order_index: 0, duration: "6 weeks"    },
    { code: "ET01", title: "Solar & Storage",                track: "energy",        description: "Solar PV systems, battery management, energy audit, smart IoT meter.",         prerequisite_code: "ETF", order_index: 1, duration: "3–4 months" },
    { code: "ET02", title: "Wind Systems",                   track: "energy",        description: "Turbine mechanics, power curves, blade aerodynamics, site assessment.",        prerequisite_code: "ETF", order_index: 2, duration: "3–4 months" },
    { code: "ET03", title: "Hydrogen & Fuel Cells",          track: "energy",        description: "Green hydrogen electrolysis, PEM fuel cells, hydrogen storage and safety.",    prerequisite_code: "ETF", order_index: 3, duration: "3–4 months" },
    { code: "ET04", title: "Grid Integration & Smart Energy",track: "energy",        description: "Smart grids, microgrids, SCADA, demand response, V2G, virtual power plants.", prerequisite_code: "ETF", order_index: 4, duration: "3–4 months" },
    { code: "ET05", title: "Energy Materials Science",       track: "energy",        description: "Perovskite solar cells, solid-state batteries, thermoelectrics.",              prerequisite_code: "ETF", order_index: 5, duration: "3–4 months" },
    { code: "SCF",  title: "Semiconductor Foundation",       track: "semiconductor", description: "Core fundamentals of semiconductor physics. Mandatory before all SC tracks.", prerequisite_code: null,  order_index: 0, duration: "6 weeks"    },
    { code: "SC01", title: "Chip Design Fundamentals",       track: "semiconductor", description: "VLSI basics, digital logic, CMOS, open-source EDA tools.",                     prerequisite_code: "SCF", order_index: 1, duration: "3–4 months" },
    { code: "SC02", title: "Power Semiconductors",           track: "semiconductor", description: "MOSFETs, IGBTs, SiC & GaN — chips inside every inverter, EV and turbine.",     prerequisite_code: "SCF", order_index: 2, duration: "3–4 months" },
    { code: "SC03", title: "Sensors & MEMS",                 track: "semiconductor", description: "Pressure/temp sensors, MEMS accelerometers, IoT integration layer.",           prerequisite_code: "SCF", order_index: 3, duration: "3–4 months" },
  ];

  const { error } = await supabase.from("courses").upsert(courses, { onConflict: "code" });
  if (error) throw error;
  console.log(`✓ ${courses.length} courses seeded`);
}

/* ── Main ──────────────────────────────────────────────────────── */
async function main() {
  try {
    const user = await createAdmin();
    await setAdminProfile(user);
    await seedCourses();

    console.log("\n✅ Setup complete!");
    console.log("─────────────────────────────────");
    console.log("LMS URL :  https://baii.in/lms");
    console.log("Email   :", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("─────────────────────────────────");
    console.log("⚠️  Change your password after first login.");
  } catch (err) {
    console.error("Setup failed:", err.message);
    process.exit(1);
  }
}

main();
