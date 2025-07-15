import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  onClose: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onClose }) => {
  const { updateProfileImage } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convertir archivo a URL de datos
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateProfileImage(imageUrl);
        toast.success('Foto de perfil actualizada correctamente');
        setIsUploading(false);
        onClose();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    updateProfileImage('');
    toast.success('Foto de perfil eliminada');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Cambiar Foto de Perfil
          </h3>
          
          <div className="space-y-6">
            {/* Opción 1: Subir nueva imagen */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Subir Nueva Imagen
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Seleccionar Imagen</span>
                  </>
                )}
              </button>
            </div>

            {/* Opción 2: Eliminar imagen actual */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Eliminar Foto Actual
              </label>
              <button
                onClick={handleRemoveImage}
                className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Eliminar Foto</span>
              </button>
            </div>

            {/* Botón cancelar */}
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-300"
            >
              Cancelar
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Formatos soportados: JPG, PNG, GIF</p>
            <p>Tamaño máximo: 5MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload; 