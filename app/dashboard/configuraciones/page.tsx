"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { configuracionService } from "@/src/lib/services";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/features/auth";
import { UserRole } from "@/src/types";

interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string;
  categoria: string;
}

export default function ConfiguracionesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { fontSize, screenReader, setFontSize, setScreenReader } = useTheme();
  const [configuraciones, setConfiguraciones] = useState<
    Record<string, Configuracion[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cambios, setCambios] = useState<Record<string, any>>({});
  const [infoSistema, setInfoSistema] = useState<any>(null);
  const [cacheLimpiando, setCacheLimpiando] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchInfoSistema();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await configuracionService.getAll();
      setConfiguraciones(data as Record<string, Configuracion[]>);
    } catch {
      setError("Error al cargar configuraciones");
    } finally {
      setLoading(false);
    }
  };

  const fetchInfoSistema = async () => {
    try {
      const info = await configuracionService.infoSistema();
      setInfoSistema(info);
    } catch {
      console.error("Error al cargar información del sistema");
    }
  };

  const handleCambio = (clave: string, valor: any, tipo: string) => {
    let valorConvertido = valor;

    if (tipo === "boolean") {
      valorConvertido = valor === "true" || valor === true;
    } else if (tipo === "integer") {
      valorConvertido = parseInt(valor) || 0;
    }

    setCambios((prev) => ({
      ...prev,
      [clave]: valorConvertido,
    }));
  };

  const handleGuardar = async () => {
    try {
      setError("");
      setSuccess("");

      const configuracionesArray = Object.entries(cambios).map(
        ([clave, valor]) => ({
          clave,
          valor,
        })
      );

      await configuracionService.actualizar(configuracionesArray);
      setSuccess(
        "✅ Configuraciones guardadas correctamente. Los cambios se han aplicado al sistema."
      );
      setCambios({});
      fetchData();

      // Recargar la página después de 2 segundos para reflejar los cambios en el menú
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch {
      setError("Error al guardar configuraciones");
    }
  };

  const handleLimpiarCache = async () => {
    if (
      !confirm(
        "¿Estás seguro de limpiar el cache? Esto puede afectar temporalmente el rendimiento del sistema."
      )
    ) {
      return;
    }

    try {
      setCacheLimpiando(true);
      setError("");
      setSuccess("");

      await configuracionService.limpiarCache();
      setSuccess("Cache limpiado correctamente");
    } catch {
      setError("Error al limpiar cache");
    } finally {
      setCacheLimpiando(false);
    }
  };

  const renderInput = (config: Configuracion) => {
    const valorActual =
      cambios[config.clave] !== undefined
        ? cambios[config.clave]
        : config.valor;

    if (config.tipo === "boolean") {
      // Convertir el valor a string para comparación consistente
      const valorString =
        valorActual === true || valorActual === "true" ? "true" : "false";

      return (
        <select
          value={valorString}
          onChange={(e) =>
            handleCambio(config.clave, e.target.value, config.tipo)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="true">Activado</option>
          <option value="false">Desactivado</option>
        </select>
      );
    }

    if (config.tipo === "integer") {
      return (
        <input
          type="number"
          value={valorActual}
          onChange={(e) =>
            handleCambio(config.clave, e.target.value, config.tipo)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }

    return (
      <input
        type="text"
        value={valorActual}
        onChange={(e) =>
          handleCambio(config.clave, e.target.value, config.tipo)
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    );
  };

  const categoriaNombres: Record<string, string> = {
    general: "Configuración General",
    modulos: "Módulos del Sistema",
    seguridad: "Seguridad",
    sistema: "Sistema",
    accesibilidad: "Accesibilidad",
  };

  // Verificar si el modo mantenimiento está activo
  const modoMantenimientoConfig = configuraciones.sistema?.find(
    (c) => c.clave === "sistema_modo_mantenimiento"
  );
  const modoMantenimientoActivo =
    cambios["sistema_modo_mantenimiento"] !== undefined
      ? cambios["sistema_modo_mantenimiento"]
      : modoMantenimientoConfig?.valor === "true";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando configuraciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin
              ? "Configuraciones del Sistema"
              : "Preferencias de Accesibilidad"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Gestiona módulos del sistema y preferencias de accesibilidad"
              : "Personaliza tu experiencia en la aplicación"}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-3">
            <Button
              onClick={handleLimpiarCache}
              variant="outline"
              disabled={cacheLimpiando}
            >
              {cacheLimpiando ? "Limpiando..." : "🗑️ Limpiar Cache"}
            </Button>

            {Object.keys(cambios).length > 0 && (
              <Button onClick={handleGuardar} variant="primary">
                💾 Guardar Cambios ({Object.keys(cambios).length})
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Preferencias de Accesibilidad - Disponible para todos */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-bold mb-4 text-blue-900">
          ♿ Preferencias de Accesibilidad
        </h2>
        <p className="text-sm text-blue-700 mb-4">
          Estas configuraciones se aplican solo en tu navegador actual y mejoran
          tu experiencia de uso
        </p>

        <div className="space-y-4">
          <div className="border-b border-blue-200 pb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tamaño de Fuente
            </label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Pequeño</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Ajusta el tamaño del texto en toda la aplicación
            </p>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={screenReader}
                onChange={(e) => setScreenReader(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Optimizar para Lector de Pantalla
                </span>
                <p className="text-xs text-gray-500">
                  Mejora la compatibilidad con tecnologías asistivas
                </p>
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* Información del Sistema - Solo Admin */}
      {isAdmin && infoSistema && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">📊 Información del Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Versión PHP</p>
              <p className="font-semibold">{infoSistema.php_version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Versión Laravel</p>
              <p className="font-semibold">{infoSistema.laravel_version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Base de Datos</p>
              <p className="font-semibold">{infoSistema.database}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Driver de Cache</p>
              <p className="font-semibold">{infoSistema.cache_driver}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Zona Horaria</p>
              <p className="font-semibold">{infoSistema.timezone}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Modo de Mantenimiento - Solo Admin */}
      {isAdmin && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
              🔧
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-orange-900">
                Modo de Mantenimiento
              </h2>
              <p className="text-sm text-orange-700 mt-1">
                Activa el modo mantenimiento para realizar actualizaciones o
                reparaciones del sistema
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-4">
            {configuraciones.sistema
              ?.filter((c) => c.clave === "sistema_modo_mantenimiento")
              .map((config) => {
                const modoMantenimientoActivo =
                  cambios[config.clave] !== undefined
                    ? cambios[config.clave]
                    : config.valor === "true";

                return (
                  <div key={config.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={modoMantenimientoActivo}
                              onChange={(e) =>
                                handleCambio(
                                  config.clave,
                                  e.target.checked,
                                  "boolean"
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {modoMantenimientoActivo
                                ? "🟠 Modo Mantenimiento ACTIVADO"
                                : "⚪ Modo Mantenimiento Desactivado"}
                            </span>
                            <p className="text-xs text-gray-500">
                              {modoMantenimientoActivo
                                ? "Solo los administradores pueden acceder al sistema"
                                : "Todos los usuarios tienen acceso normal"}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {modoMantenimientoActivo && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Mensaje de Mantenimiento
                        </label>
                        {configuraciones.sistema
                          ?.filter(
                            (c) => c.clave === "sistema_mensaje_mantenimiento"
                          )
                          .map((mensajeConfig) => (
                            <textarea
                              key={mensajeConfig.id}
                              value={
                                cambios[mensajeConfig.clave] !== undefined
                                  ? cambios[mensajeConfig.clave]
                                  : mensajeConfig.valor
                              }
                              onChange={(e) =>
                                handleCambio(
                                  mensajeConfig.clave,
                                  e.target.value,
                                  "string"
                                )
                              }
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Mensaje que verán los usuarios durante el mantenimiento"
                            />
                          ))}
                        <p className="text-xs text-gray-500 mt-1">
                          Este mensaje se mostrará a los usuarios cuando
                          intenten acceder al sistema
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

            {modoMantenimientoActivo && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 text-lg">⚠️</span>
                  <div className="text-sm text-orange-800">
                    <p className="font-semibold">Advertencia:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        Los usuarios no administradores no podrán acceder al
                        sistema
                      </li>
                      <li>
                        Los administradores seguirán teniendo acceso completo
                      </li>
                      <li>
                        Asegúrate de desactivar el modo al finalizar el
                        mantenimiento
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Configuraciones del Sistema - Solo Admin */}
      {isAdmin &&
        Object.entries(configuraciones)
          .filter(([categoria]) => categoria !== "accesibilidad") // Ocultar categoría accesibilidad (ahora es local)
          .map(([categoria, configs]) => (
            <Card key={categoria} className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {categoria === "modulos" && "🧩 "}
                {categoria === "seguridad" && "🔒 "}
                {categoria === "general" && "⚙️ "}
                {categoria === "sistema" && "💻 "}
                {categoriaNombres[categoria] || categoria}
              </h2>

              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {config.descripcion || config.clave}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">{renderInput(config)}</div>
                        {cambios[config.clave] !== undefined && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Modificado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Clave:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          {config.clave}
                        </code>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

      {/* Advertencias - Solo Admin */}
      {isAdmin && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-2">
            ⚠️ Advertencias Importantes
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • Desactivar módulos ocultará funcionalidades para todos los
              usuarios
            </li>
            <li>
              • La protección de grados/secciones requiere confirmación
              adicional para modificaciones
            </li>
            <li>
              • Limpiar cache puede afectar temporalmente el rendimiento del
              sistema
            </li>
            <li>• Los cambios en configuraciones se aplican inmediatamente</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
