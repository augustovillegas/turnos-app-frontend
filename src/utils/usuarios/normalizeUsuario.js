// === normalizeUsuario ===
// Normaliza la forma de un usuario según el contrato actualizado del backend.
// DTO esperado: {id, nombre, email, rol, estado, isApproved, modulo, cohorte, creadoEn}

export const normalizeUsuario = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;

  const estado = raw.estado ?? raw.status ?? "Pendiente";
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = resolvedId ?? `temp-${crypto?.randomUUID?.() || Date.now()}`;
  const moduloFinal = raw.modulo ?? null;
  const cohorteFinal =
    raw.cohorte != null
      ? Number.isFinite(Number(raw.cohorte))
        ? Number(raw.cohorte)
        : null
      : null;

  return {
    id: temporalId,
    temporalId,
    nombre: raw.nombre ?? raw.name ?? "",
    name: raw.nombre ?? raw.name ?? "",
    email: raw.email ?? raw.correo ?? "",
    rol: raw.rol ?? raw.role ?? "",
    role: raw.rol ?? raw.role ?? "",
    estado,
    status: estado,
    isApproved: raw.isApproved ?? estado === "Aprobado",
    modulo: moduloFinal,
    cohorte: cohorteFinal,
    creadoEn: raw.creadoEn ?? raw.createdAt ?? null,
  };
};

// === normalizeUsuariosCollection ===
// Normaliza un array de usuarios
export const normalizeUsuariosCollection = (usuarios = []) => {
  if (!Array.isArray(usuarios)) return [];
  return usuarios.map(normalizeUsuario);
};
