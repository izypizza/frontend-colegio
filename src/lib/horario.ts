export interface FranjaAcademica {
  etiqueta: string;
  inicio: string;
  fin: string;
  tipo: "clase" | "receso";
}

export const MINUTOS_POR_HORA_ACADEMICA = 45;

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
] as const;

export const FRANJAS_ACADEMICAS: FranjaAcademica[] = [
  { etiqueta: "Hora 1", inicio: "08:00", fin: "08:45", tipo: "clase" },
  { etiqueta: "Hora 2", inicio: "08:45", fin: "09:30", tipo: "clase" },
  { etiqueta: "Hora 3", inicio: "09:30", fin: "10:15", tipo: "clase" },
  { etiqueta: "Recreo", inicio: "10:15", fin: "10:30", tipo: "receso" },
  { etiqueta: "Hora 4", inicio: "10:30", fin: "11:15", tipo: "clase" },
  { etiqueta: "Hora 5", inicio: "11:15", fin: "12:00", tipo: "clase" },
  { etiqueta: "Hora 6", inicio: "12:00", fin: "12:45", tipo: "clase" },
];

export const normalizarHora = (valor?: string | null): string => {
  if (!valor) return "";

  const coincidencia = valor.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!coincidencia) return valor.trim();

  const horas = coincidencia[1].padStart(2, "0");
  const minutos = coincidencia[2];

  return `${horas}:${minutos}`;
};

export const minutosDeHora = (valor?: string | null): number => {
  const normalizada = normalizarHora(valor);
  if (!normalizada) return Number.MAX_SAFE_INTEGER;

  const [horas, minutos] = normalizada.split(":").map(Number);

  return horas * 60 + minutos;
};

export const sumarMinutos = (hora: string, minutos: number): string => {
  const total = minutosDeHora(hora) + minutos;
  const horas = Math.floor(total / 60) % 24;
  const resto = total % 60;

  return `${String(horas).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
};

/**
 * Construye las filas del calendario: las horas académicas oficiales más
 * cualquier bloque registrado fuera de ese rango, para no ocultar datos.
 */
export const construirFilasHorario = (
  bloques: { hora_inicio?: string | null; hora_fin?: string | null }[] = [],
): FranjaAcademica[] => {
  const conocidas = new Set(
    FRANJAS_ACADEMICAS.map((franja) => franja.inicio),
  );

  const extras = new Map<string, FranjaAcademica>();

  bloques.forEach((bloque) => {
    const inicio = normalizarHora(bloque.hora_inicio);
    if (!inicio || conocidas.has(inicio)) return;

    extras.set(inicio, {
      etiqueta: "Bloque",
      inicio,
      fin: normalizarHora(bloque.hora_fin) || sumarMinutos(inicio, 45),
      tipo: "clase",
    });
  });

  return [...FRANJAS_ACADEMICAS, ...extras.values()].sort(
    (a, b) => minutosDeHora(a.inicio) - minutosDeHora(b.inicio),
  );
};

export const buscarBloqueEnFranja = <
  T extends { dia: string; hora_inicio?: string | null },
>(
  bloques: T[],
  dia: string,
  franja: FranjaAcademica,
): T | undefined =>
  bloques.find(
    (bloque) =>
      bloque.dia?.toLowerCase() === dia.toLowerCase() &&
      normalizarHora(bloque.hora_inicio) === franja.inicio,
  );

export const rangoHorario = (inicio?: string | null, fin?: string | null) => {
  const desde = normalizarHora(inicio);
  const hasta = normalizarHora(fin);

  if (!desde && !hasta) return "";
  if (!hasta) return desde;

  return `${desde} - ${hasta}`;
};
