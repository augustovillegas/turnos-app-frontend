/* eslint-env node */
import path from "node:path";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const ROLE_ENV_KEYS = {
  alumno: ["TEST_E2E_ALUMNO_EMAIL", "TEST_E2E_ALUMNO_PASSWORD"],
  profesor: ["TEST_E2E_PROFESOR_EMAIL", "TEST_E2E_PROFESOR_PASSWORD"],
  superadmin: [
    "TEST_E2E_SUPERADMIN_EMAIL",
    "TEST_E2E_SUPERADMIN_PASSWORD",
  ],
};

const hasRoleCredentials = (role) => {
  const keys = ROLE_ENV_KEYS[role];
  if (!keys || keys.length === 0) {
    return false;
  }
  return keys.every((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.trim() !== "";
  });
};

export const requireRoles = (...roles) => {
  const missing = roles.filter((role) => !hasRoleCredentials(role));
  if (!missing.length) {
    return true;
  }
  const envs = [
    ...new Set(
      missing.flatMap((role) => ROLE_ENV_KEYS[role] ?? [])
    ),
  ];
  console.warn(
    `[e2e] falta/s ${missing.join(
      ", "
    )} | define ${envs.join(
      ", "
    )} en tus variables de entorno para habilitar estas pruebas.`
  );
  return false;
};
