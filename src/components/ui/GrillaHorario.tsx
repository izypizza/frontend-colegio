"use client";

import { useMemo, type ReactNode } from "react";
import {
  DIAS_SEMANA,
  buscarBloqueEnFranja,
  construirFilasHorario,
  rangoHorario,
} from "@/src/lib/horario";

export interface BloqueHorario {
  dia: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
}

interface GrillaHorarioProps<T extends BloqueHorario> {
  bloques: T[];
  renderBloque: (bloque: T) => ReactNode;
  onSeleccionar?: (bloque: T) => void;
  claseBloque?: (bloque: T) => string;
}

const CLASE_BLOQUE_POR_DEFECTO = "border-[#04ADBF] bg-[#04ADBF]/10";

/**
 * Calendario semanal con las horas académicas del colegio (45 minutos).
 * Se reutiliza en planificación, en el horario por hijo y en el detalle del
 * estudiante para que las tres vistas coincidan siempre.
 */
export function GrillaHorario<T extends BloqueHorario>({
  bloques,
  renderBloque,
  onSeleccionar,
  claseBloque = () => CLASE_BLOQUE_POR_DEFECTO,
}: GrillaHorarioProps<T>) {
  const filas = useMemo(() => construirFilasHorario(bloques), [bloques]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-24 border border-gray-200 bg-gray-100 px-2 py-2 text-left text-xs font-bold uppercase text-gray-600">
              Hora
            </th>
            {DIAS_SEMANA.map((dia) => (
              <th
                key={dia}
                className="min-w-[140px] border border-gray-200 bg-[#04ADBF] px-2 py-2 text-center text-xs font-bold uppercase text-white"
              >
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((franja) => {
            if (franja.tipo === "receso") {
              return (
                <tr key={franja.inicio} className="bg-gray-50">
                  <td className="sticky left-0 z-10 border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500">
                    {rangoHorario(franja.inicio, franja.fin)}
                  </td>
                  <td
                    colSpan={DIAS_SEMANA.length}
                    className="border border-gray-200 px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Recreo
                  </td>
                </tr>
              );
            }

            return (
              <tr key={franja.inicio}>
                <td className="sticky left-0 z-10 border border-gray-200 bg-gray-50 px-2 py-2 align-top">
                  <span className="block text-[11px] font-bold uppercase text-gray-700">
                    {franja.etiqueta}
                  </span>
                  <span className="block text-[11px] text-gray-500">
                    {rangoHorario(franja.inicio, franja.fin)}
                  </span>
                </td>

                {DIAS_SEMANA.map((dia) => {
                  const bloque = buscarBloqueEnFranja(bloques, dia, franja);

                  if (!bloque) {
                    return (
                      <td
                        key={`${dia}-${franja.inicio}`}
                        className="border border-gray-200 p-1 align-top"
                      />
                    );
                  }

                  const clase = `h-full w-full rounded-md border-l-4 p-2 text-left ${claseBloque(
                    bloque,
                  )}`;

                  return (
                    <td
                      key={`${dia}-${franja.inicio}`}
                      className="border border-gray-200 p-1 align-top"
                    >
                      {onSeleccionar ? (
                        <button
                          type="button"
                          onClick={() => onSeleccionar(bloque)}
                          className={`${clase} transition-shadow hover:shadow-md`}
                        >
                          {renderBloque(bloque)}
                        </button>
                      ) : (
                        <div className={clase}>{renderBloque(bloque)}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
