import "dotenv/config";
import axios from "axios";

const baseURL = process.env.VITE_API_URL || "http://localhost:3000/api";

async function test() {
  try {
    // First, get superadmin token
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: "superadmin@example.com",
      password: "SuperAdmin@123",
    });

    const token = loginRes.data.token;
    console.log("✅ Authenticated with superadmin");

    const client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Create a test user
    const payload = {
      nombre: `Diagnostic Test ${Date.now()}`,
      email: `diag.${Date.now()}@local.dev`,
      password: "Test-2025#Secure",
      role: "alumno",
      modulo: "JAVASCRIPT",
      moduleNumber: 2,
      cohort: 2,
    };

    console.log("\n📤 SENDING PAYLOAD:");
    console.log(JSON.stringify(payload, null, 2));

    const createRes = await client.post("/usuarios", payload);

    console.log("\n📥 RESPONSE STATUS:", createRes.status);
    console.log("\n📥 RESPONSE DATA:");
    console.log(JSON.stringify(createRes.data, null, 2));

    console.log("\n🔍 FIELD ANALYSIS:");
    console.log("- Has 'rol'?", "rol" in createRes.data);
    console.log("- Has 'role'?", "role" in createRes.data);
    console.log("- Has 'modulo'?", "modulo" in createRes.data);
    console.log("- Has 'moduleNumber'?", "moduleNumber" in createRes.data);
    console.log("- Has 'cohort'?", "cohort" in createRes.data);

    // Cleanup
    if (createRes.data?.id) {
      await client.delete(`/usuarios/${createRes.data.id}`);
      console.log("\n✅ Cleaned up test user");
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

test();
