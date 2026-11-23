"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, Modal, Table } from "@/src/components/ui";
import { reporteService } from "@/src/lib/services";
import { descargarBlob } from "@/src/lib/utils";

interface FilaSeccion {
  id: number;
  grado: string;
  nivel: string;
  nombre: string;
  turno: string | null;
  capacidad: number;
  matriculados: number;
  vacantes: number;
  ocupacion: number;
}

interface ResumenNivel {
  nivel: string;
  secciones: number;
  capacidad: number;
  matriculados: number;
  ocupacion: number;
}

interface DatosReporte {
  generado_en: string;
  filtros: string | null;
  totales: {
    secciones: number;
    capacidad: number;
    matriculados: number;
    vacantes: number;
    ocupacion: number;
  };
  niveles: ResumenNivel[];
  secciones: FilaSeccion[];
}

interface EstudianteNomina {
  numero: number;
  id: number;
  nombre_completo: string;
  dni: string;
  fecha_nacimiento: string | null;
  estado: string;
  telefono: string | null;
}

interface NominaSeccion {
  seccion: {
    id: number;
    nombre: string;
    turno: string | null;
    grado: string;
    nivel: string;
    capacidad_maxima: number | null;
  };
  total: number;
  estudiantes: EstudianteNomina[];
}

const colorOcupacion = (ocupacion: number) => {
  if (ocupacion >= 95) return "bg-red-500";
  if (ocupacion >= 70) return "bg-amber-500";
  return "bg-[#04ADBF]";
};

export default function ReporteSeccionesPage() {
  const [datos, setDatos] = useState<DatosReporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nivel, setNivel] = useState("");
  const [turno, setTurno] = useState("");
  const [buscar, setBuscar] = useState("");
  const [termino, setTermino] = useState("");
  const [descargando, setDescargando] = useState<string | null>(null);

  const [nomina, setNomina] = useState<NominaSeccion | null>(null);
  const [cargandoNomina, setCargandoNomina] = useState(false);
  const [nominaAbierta, setNominaAbierta] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setTermino(buscar.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [buscar]);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const respuesta = await reporteService.secciones({
          nivel: nivel || undefined,
          turno: turno || undefined,
          buscar: termino || undefined,
        });
        if (activo) {
          setDatos(respuesta);
        }
      } catch (err: any) {
        if (activo) {
          setError(
            err?.message || "No se pudo cargar el reporte de secciones.",
          );
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [nivel, turno, termino]);

  const descargarConsolidado = async (formato: "pdf" | "excel") => {
    try {
      setDescargando(formato);
      setError(null);
      const filtros = { nivel: nivel || undefined, turno: turno || undefined };
      const blob =
        formato === "pdf"
          ? await reporteService.seccionesPdf(filtros)
          : await reporteService.seccionesExcel(filtros);
      descargarBlob(
        blob as Blob,
        `reporte-secciones.${formato === "pdf" ? "pdf" : "xlsx"}`,
      );
    } catch (err: any) {
      setError(err?.message || "No se pudo generar el archivo.");
    } finally {
      setDescargando(null);
    }
  };

  const abrirNomina = async (fila: FilaSeccion) => {
    try {
      setCargandoNomina(true);
      setNominaAbierta(true);
      setNomina(null);
      const respuesta = await reporteService.nominaSeccion(fila.id);
      setNomina(respuesta);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la nómina de la sección.");
      setNominaAbierta(false);
    } finally {
      setCargandoNomina(false);
    }
  };

  const descargarNomina = async (formato: "pdf" | "excel") => {
    if (!nomina) return;

    try {
      setDescargando(`nomina-${formato}`);
      const blob =
        formato === "pdf"
          ? await reporteService.nominaSeccionPdf(nomina.seccion.id)
          : await reporteService.nominaSeccionExcel(nomina.seccion.id);
      const nombre = `nomina-${nomina.seccion.grado}-${nomina.seccion.nombre}.${
        formato === "pdf" ? "pdf" : "xlsx"
      }`;
      descargarBlob(blob as Blob, nombre);
    } catch (err: any) {
      setError(err?.message || "No se pudo generar la nómina.");
    } finally {
      setDescargando(null);
    }
  };

  const columnas = [
    { key: "nivel", label: "Nivel" },
    { key: "grado", label: "Grado" },
    { key: "nombre", label: "Sección" },
    {
      key: "turno",
      label: "Turno",
      render: (valor: unknown) => (valor ? String(valor) : "—"),
    },
    {
      key: "capacidad",
      label: "Capacidad",
      render: (valor: unknown) => String(valor ?? 0),
    },
    {
      key: "matriculados",
      label: "Matriculados",
      render: (valor: unknown) => String(valor ?? 0),
    },
    {
      key: "vacantes",
      label: "Vacantes",
      render: (valor: unknown) => String(valor ?? 0),
    },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (valor: unknown, fila: FilaSeccion) => (
        <div className="min-w-[110px]">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{fila.ocupacion}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className={`h-1.5 rounded-full ${colorOcupacion(fila.ocupacion)}`}
              style={{ width: `${Math.min(fila.ocupacion, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reporte de secciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Capacidad, matriculados y vacantes por sección
            {datos?.generado_en ? ` · Actualizado ${datos.generado_en}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/grados"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Volver a grados
          </Link>
          <Button
            variant="outline"
            onClick={() => descargarConsolidado("pdf")}
            disabled={descargando !== null}
          >
            {descargando === "pdf" ? "Generando..." : "Descargar PDF"}
          </Button>
          <Button
            variant="primary"
            onClick={() => descargarConsolidado("excel")}
            disabled={descargando !== null}
          >
            {descargando === "excel" ? "Generando..." : "Descargar Excel"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { etiqueta: "Secciones", valor: datos?.totales.secciones ?? 0 },
          { etiqueta: "Capacidad", valor: datos?.totales.capacidad ?? 0 },
          { etiqueta: "Matriculados", valor: datos?.totales.matriculados ?? 0 },
          { etiqueta: "Vacantes", valor: datos?.totales.vacantes ?? 0 },
          { etiqueta: "Ocupación", valor: `${datos?.totales.ocupacion ?? 0}%` },
        ].map((indicador) => (
          <Card key={indicador.etiqueta}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {indicador.etiqueta}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {indicador.valor}
            </p>
          </Card>
        ))}
      </div>

      {datos && datos.niveles.length > 1 && (
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Por nivel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {datos.niveles.map((resumen) => (
              <div
                key={resumen.nivel}
                className="rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800 capitalize">
                    {resumen.nivel}
                  </p>
                  <span className="text-sm font-bold text-[#04ADBF]">
                    {resumen.ocupacion}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resumen.secciones} secciones · {resumen.matriculados} de{" "}
                  {resumen.capacidad} vacantes ocupadas
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="w-full sm:w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nivel
            </label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04ADBF] focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Turno
            </label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04ADBF] focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Buscar grado o sección
            </label>
            <input
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Ej. 3° A"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04ADBF] focus:border-transparent"
            />
          </div>
        </div>

        <Table
          columns={columnas}
          data={datos?.secciones ?? []}
          loading={loading}
          extraActions={(fila) => (
            <Button variant="secondary" onClick={() => abrirNomina(fila)}>
              Nómina
            </Button>
          )}
        />
      </Card>

      <Modal
        isOpen={nominaAbierta}
        onClose={() => setNominaAbierta(false)}
        title={
          nomina
            ? `Nómina ${nomina.seccion.grado} "${nomina.seccion.nombre}"`
            : "Nómina de la sección"
        }
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setNominaAbierta(false)}>
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={() => descargarNomina("pdf")}
              disabled={!nomina || descargando !== null}
            >
              {descargando === "nomina-pdf" ? "Generando..." : "PDF"}
            </Button>
            <Button
              variant="primary"
              onClick={() => descargarNomina("excel")}
              disabled={!nomina || descargando !== null}
            >
              {descargando === "nomina-excel" ? "Generando..." : "Excel"}
            </Button>
          </div>
        }
      >
        {cargandoNomina && (
          <p className="py-6 text-center text-sm text-gray-500">
            Cargando estudiantes...
          </p>
        )}

        {!cargandoNomina && nomina && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {nomina.total} estudiantes
              {nomina.seccion.capacidad_maxima
                ? ` · capacidad ${nomina.seccion.capacidad_maxima}`
                : ""}
              {nomina.seccion.turno ? ` · turno ${nomina.seccion.turno}` : ""}
            </p>

            {nomina.estudiantes.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                La sección no tiene estudiantes registrados.
              </p>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-2 px-2 font-semibold">N</th>
                      <th className="py-2 px-2 font-semibold">
                        Apellidos y nombres
                      </th>
                      <th className="py-2 px-2 font-semibold">DNI</th>
                      <th className="py-2 px-2 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nomina.estudiantes.map((estudiante) => (
                      <tr
                        key={estudiante.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2 px-2 text-gray-500">
                          {estudiante.numero}
                        </td>
                        <td className="py-2 px-2 text-gray-800">
                          {estudiante.nombre_completo}
                        </td>
                        <td className="py-2 px-2 text-gray-600">
                          {estudiante.dni}
                        </td>
                        <td className="py-2 px-2 text-gray-600 capitalize">
                          {estudiante.estado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
