"use client";

import React, { useState } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

interface AssistantStep {
  element?: string;
  title: string;
  text: string;
  position?: "bottom" | "top" | "left" | "right";
}

interface AssistantProps {
  tourName?: string;
  enabled?: boolean;
  onComplete?: () => void;
}

// Tours completos organizados por módulo
const systemTours = {
  completo: [
    {
      title: "Bienvenido al Sistema I.E. Túpac Amaru",
      text: "Te guiaré por todas las funcionalidades del sistema educativo. Este tour te mostrará cómo usar cada módulo de forma efectiva.",
    },
    {
      element: "[href='/dashboard']",
      title: "Dashboard Principal",
      text: "Vista general con estadísticas en tiempo real y accesos rápidos a funciones principales según tu rol",
      position: "right",
    },
    {
      element: "[href='/dashboard/estudiantes']",
      title: "Gestión de Estudiantes",
      text: "Registro completo, edición y consulta de estudiantes. Incluye asignación a secciones, gestión de datos personales y seguimiento académico",
      position: "right",
    },
    {
      element: "[href='/dashboard/docentes']",
      title: "Gestión de Docentes",
      text: "Administración de profesores, especialidades y asignación de materias por secciones. Control de asignaciones académicas",
      position: "right",
    },
    {
      element: "[href='/dashboard/padres']",
      title: "Gestión de Padres",
      text: "Registro de padres y tutores, vinculación con estudiantes para seguimiento académico y comunicación directa",
      position: "right",
    },
    {
      element: "[href='/dashboard/grados']",
      title: "Grados y Secciones",
      text: "Configuración de estructura educativa: grados de Primaria y Secundaria con múltiples secciones y turnos mañana/tarde",
      position: "right",
    },
    {
      element: "[href='/dashboard/materias']",
      title: "Materias",
      text: "Catálogo de asignaturas: Matemática, Comunicación, Ciencias y más, con asignación por nivel educativo",
      position: "right",
    },
    {
      element: "[href='/dashboard/periodos']",
      title: "Períodos Académicos",
      text: "Gestión de años escolares y bimestres para organizar las calificaciones por períodos de evaluación",
      position: "right",
    },
    {
      element: "[href='/dashboard/horarios']",
      title: "Horarios de Clases",
      text: "Programación de horarios por sección, materia y docente. Incluye gestión de turnos mañana/tarde",
      position: "right",
    },
    {
      element: "[href='/dashboard/calificaciones']",
      title: "Calificaciones",
      text: "Sistema de notas donde docentes ingresan calificaciones y el sistema calcula promedios automáticamente por bimestre",
      position: "right",
    },
    {
      element: "[href='/dashboard/asistencias']",
      title: "Control de Asistencias",
      text: "Registro de asistencia con estados: Presente, Tarde, Ausente. Incluye observaciones y generación de reportes",
      position: "right",
    },
    {
      element: "[href='/dashboard/biblioteca']",
      title: "Biblioteca Virtual",
      text: "Catálogo de libros físicos y digitales. Gestión completa de préstamos, devoluciones y renovaciones",
      position: "right",
    },
    {
      element: "[href='/dashboard/elecciones']",
      title: "Sistema de Votación",
      text: "Elecciones escolares: municipio escolar, brigadier y más. Votación digital con resultados en tiempo real",
      position: "right",
    },
    {
      element: "[href='/dashboard/configuraciones']",
      title: "Configuración del Sistema",
      text: "Ajustes globales: modo mantenimiento, activación de módulos, parámetros institucionales (solo Administrador)",
      position: "right",
    },
    {
      title: "Tour Completado",
      text: "Ya conoces todas las funciones del sistema. Necesitas ayuda? Haz clic en el botón flotante cuando quieras repetir el tour.",
    },
  ],

  dashboard: [
    {
      title: "Dashboard - Vista General",
      text: "Aquí verás estadísticas personalizadas según tu rol: resumen de estudiantes, calificaciones, asistencias y actividad reciente",
    },
    {
      element: ".stats-grid",
      title: "Tarjetas Estadísticas",
      text: "Resumen numérico actualizado en tiempo real con los datos más importantes de tu actividad",
      position: "bottom",
    },
  ],

  estudiantes: [
    {
      title: "Módulo de Estudiantes",
      text: "Gestión completa de los 421 estudiantes del colegio distribuidos en 54 secciones",
    },
    {
      element: "button[aria-label*='Nuevo']",
      title: "Registrar Estudiante",
      text: "Clic aquí para agregar un nuevo estudiante con datos personales completos y asignación a sección",
      position: "bottom",
    },
    {
      element: "input[type='search']",
      title: "Búsqueda Rápida",
      text: "Busca por nombre completo, DNI o código de estudiante. Resultados instantáneos",
      position: "bottom",
    },
  ],

  calificaciones: [
    {
      title: "Sistema de Calificaciones",
      text: "Registro y consulta de 20,528 notas académicas por bimestre con cálculo automático de promedios",
    },
    {
      element: ".periodo-selector",
      title: "Selección de Período",
      text: "Elige el año académico y bimestre específico para ver o registrar notas",
      position: "bottom",
    },
  ],

  asistencias: [
    {
      title: "Control de Asistencias",
      text: "8,820 registros de asistencia con sistema de 3 estados y observaciones detalladas",
    },
    {
      element: ".fecha-selector",
      title: "Fecha de Registro",
      text: "Selecciona la fecha para marcar asistencia del día",
      position: "bottom",
    },
    {
      element: ".estado-buttons",
      title: "Estados de Asistencia",
      text: "Presente, Tarde (con hora de llegada), Ausente - Marca el estado de cada estudiante",
      position: "bottom",
    },
  ],

  biblioteca: [
    {
      title: "Biblioteca Virtual",
      text: "Gestión de catálogo de 15 libros y sistema completo de préstamos",
    },
    {
      element: ".libro-tipo",
      title: "Tipos de Libros",
      text: "Físico: préstamo tradicional con plazo de devolución. Digital: acceso online inmediato sin límite",
      position: "bottom",
    },
  ],

  configuraciones: [
    {
      title: "Panel de Configuración",
      text: "Ajustes avanzados del sistema (requiere rol de Administrador). Controla todo el comportamiento institucional",
    },
    {
      element: ".modulos-config",
      title: "Activar/Desactivar Módulos",
      text: "Controla qué funcionalidades están disponibles: biblioteca, elecciones, calificaciones, etc.",
      position: "bottom",
    },
  ],
};

export const Assistant: React.FC<AssistantProps> = ({
  tourName = "completo",
  enabled = false,
  onComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const startTour = () => {
    const steps =
      systemTours[tourName as keyof typeof systemTours] || systemTours.completo;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "shepherd-theme-custom",
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: {
          enabled: true,
        },
      },
    });

    // Filtrar pasos: solo agregar los que tienen elemento disponible o los que no requieren elemento
    const availableSteps = steps.filter((step) => {
      if (!step.element) return true; // Pasos sin elemento siempre se incluyen

      // Verificar si el elemento existe en el DOM
      const element = document.querySelector(step.element);
      return element !== null;
    });

    availableSteps.forEach((step, index) => {
      const stepConfig: any = {
        id: `step-${index}`,
        title: step.title,
        text: step.text,
        buttons: [
          ...(index > 0
            ? [
                {
                  text: "Atras",
                  action: () => tour.back(),
                  classes: "shepherd-button-secondary",
                },
              ]
            : []),
          {
            text:
              index === availableSteps.length - 1 ? "Finalizar" : "Siguiente",
            action: () => tour.next(),
            classes: "shepherd-button-primary",
          },
        ],
      };

      if (step.element) {
        stepConfig.attachTo = {
          element: step.element,
          on: step.position || "bottom",
        };
      }

      tour.addStep(stepConfig);
    });

    tour.on("complete", () => {
      setIsRunning(false);
      onComplete?.();
    });

    tour.on("cancel", () => {
      setIsRunning(false);
    });

    setIsRunning(true);
    tour.start();
  };

  return (
    <>
      <button
        onClick={startTour}
        disabled={isRunning}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#04ADBF] to-[#038a9a] text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50 group disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
        title="Iniciar tour del sistema"
        aria-label="Asistente virtual"
        style={{ animationDuration: "3s" }}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>

        {/* Pulse animation cuando no está corriendo */}
        {!isRunning && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F22727] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F22727]"></span>
          </span>
        )}

        {/* Tooltip mejorado */}
        <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-2xl whitespace-nowrap">
            {isRunning
              ? "Tour en progreso..."
              : "Iniciar tour completo del sistema"}
            <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </button>
    </>
  );
};

export default Assistant;
