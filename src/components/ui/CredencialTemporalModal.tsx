"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Alert } from "./Alert";

interface CredencialTemporalModalProps {
  isOpen: boolean;
  usuario: { name: string; email: string } | null;
  passwordTemporal: string;
  onClose: () => void;
  error?: string | null;
}

export function CredencialTemporalModal({
  isOpen,
  usuario,
  passwordTemporal,
  onClose,
  error,
}: CredencialTemporalModalProps) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(passwordTemporal);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contraseña restablecida"
      footer={
        <>
          <Button variant="secondary" onClick={copiar}>
            {copiado ? "Copiado" : "Copiar contraseña"}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Entendido
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <Alert
          type="warning"
          message="Esta contraseña se muestra una sola vez. Cópiala o anótala antes de cerrar."
        />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Usuario</p>
          <p className="font-semibold text-gray-800">
            {usuario?.name ?? "Usuario"}
          </p>
          <p className="text-sm text-gray-600">{usuario?.email ?? ""}</p>

          <p className="text-sm text-gray-500 mt-4">Contraseña temporal</p>
          <p className="font-mono text-2xl font-bold text-gray-900 tracking-wide select-all">
            {passwordTemporal}
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>1. Entrega esta contraseña al usuario en secretaría.</p>
          <p>2. Pídele que la cambie apenas ingrese al sistema.</p>
          <p>3. Sus sesiones anteriores se cerraron por seguridad.</p>
        </div>
      </div>
    </Modal>
  );
}
