'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { docentePortalService } from '@/src/lib/services';
import { useSearchParams } from 'next/navigation';

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  codigo: string;
  email: string;
  seccion: {
    nombre: string;
    grado: {
      nombre: string;
    };
  };
}

export default function MisEstudiantesPage() {
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const seccionId = searchParams.get('seccion');

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  useEffect(() => {
    filterEstudiantes();
  }, [estudiantes, searchTerm, seccionId]);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const response = await docentePortalService.misEstudiantes();
      setEstudiantes(response.estudiantes || []);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEstudiantes = () => {
    let filtered = estudiantes;

    // Filtrar por sección si viene en la URL
    if (seccionId) {
      filtered = filtered.filter(e => e.seccion.id === parseInt(seccionId));
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nombre.toLowerCase().includes(term)
      );
    }

    setFilteredEstudiantes(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Estudiantes</h1>
        <p className="text-gray-600 mt-2">Estudiantes de las secciones donde impartes clases</p>
      </div>

      {/* Buscador */}
      <Card>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Estudiantes</h3>
          <p className="text-3xl font-bold text-gray-900">{estudiantes.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Mostrando</h3>
          <p className="text-3xl font-bold text-blue-600">{filteredEstudiantes.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Secciones</h3>
          <p className="text-3xl font-bold text-gray-900">
            {new Set(estudiantes.map(e => e.seccion.id)).size}
          </p>
        </Card>
      </div>

      {/* Tabla de estudiantes */}
      <Card>
        {filteredEstudiantes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg">No se encontraron estudiantes</p>
            <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado/Sección
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEstudiantes.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {estudiante.nombre.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {estudiante.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {estudiante.seccion.grado.nombre} - {estudiante.seccion.nombre}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
