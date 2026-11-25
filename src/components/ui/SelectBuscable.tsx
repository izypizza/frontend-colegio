"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface OpcionSelect {
  valor: string | number;
  etiqueta: string;
  detalle?: string | null;
}

interface SelectBuscableProps {
  opciones: OpcionSelect[];
  valor: string | number;
  onChange: (valor: string) => void;
  placeholder?: string;
  label?: string;
  vacio?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Selector con búsqueda integrada. Evita listas kilométricas de opciones
 * y permite filtrar por varias palabras sin distinguir tildes.
 */
export function SelectBuscable({
  opciones,
  valor,
  onChange,
  placeholder = "Buscar...",
  label,
  vacio = "Seleccionar",
  required = false,
  disabled = false,
  className = "",
}: SelectBuscableProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [montado, setMontado] = useState(false);
  const [posicion, setPosicion] = useState({ top: 0, left: 0, width: 0 });
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const seleccionada = useMemo(
    () => opciones.find((opcion) => String(opcion.valor) === String(valor)),
    [opciones, valor],
  );

  useEffect(() => {
    setMontado(true);
  }, []);

  // El panel se dibuja fuera del flujo de la página, así que hay que medir el
  // botón para colocarlo y volver a medir si la página se desplaza.
  const medir = useCallback(() => {
    const rect = boton.current?.getBoundingClientRect();
    if (!rect) return;

    const altoEstimado = 300;
    const espacioAbajo = window.innerHeight - rect.bottom;
    const top =
      espacioAbajo < altoEstimado && rect.top > altoEstimado
        ? rect.top - altoEstimado - 4
        : rect.bottom + 4;

    setPosicion({ top, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!abierto) return;

    medir();

    const cerrar = (evento: MouseEvent) => {
      const objetivo = evento.target as Node;

      if (contenedor.current?.contains(objetivo)) return;
      if (panel.current?.contains(objetivo)) return;

      setAbierto(false);
      setBusqueda("");
    };

    const alDesplazar = () => medir();

    document.addEventListener("mousedown", cerrar);
    window.addEventListener("resize", alDesplazar);
    window.addEventListener("scroll", alDesplazar, true);

    return () => {
      document.removeEventListener("mousedown", cerrar);
      window.removeEventListener("resize", alDesplazar);
      window.removeEventListener("scroll", alDesplazar, true);
    };
  }, [abierto, medir]);

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    if (!termino) return opciones;

    const palabras = termino.split(/\s+/).filter(Boolean);

    return opciones.filter((opcion) => {
      const texto = normalizar(`${opcion.etiqueta} ${opcion.detalle || ""}`);
      return palabras.every((palabra) => texto.includes(palabra));
    });
  }, [opciones, busqueda]);

  const elegir = (opcion: OpcionSelect) => {
    onChange(String(opcion.valor));
    setAbierto(false);
    setBusqueda("");
  };

  return (
    <div className={`relative ${className}`} ref={contenedor}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      <input type="hidden" value={valor} required={required} readOnly />

      <button
        ref={boton}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!abierto) medir();
          setAbierto((previo) => !previo);
        }}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <span className={seleccionada ? "" : "text-gray-500"}>
          {seleccionada ? seleccionada.etiqueta : vacio}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${abierto ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {abierto &&
        montado &&
        createPortal(
          <div
            ref={panel}
            style={{
              position: "fixed",
              top: posicion.top,
              left: posicion.left,
              width: posicion.width,
            }}
            className="z-[10000] rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                autoFocus
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
              {filtradas.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">
                  Sin coincidencias
                </li>
              ) : (
                filtradas.slice(0, 100).map((opcion) => (
                  <li key={String(opcion.valor)}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={String(opcion.valor) === String(valor)}
                      onClick={() => elegir(opcion)}
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        String(opcion.valor) === String(valor)
                          ? "bg-blue-50 font-medium text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {opcion.etiqueta}
                      {opcion.detalle && (
                        <span className="block text-xs text-gray-500">
                          {opcion.detalle}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>

            {filtradas.length > 100 && (
              <p className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
                Mostrando 100 de {filtradas.length}. Escribe para acotar.
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
