// src/components/AccountSettings.tsx
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AccountSettings({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuth();
  const [profileImage, setProfileImage] = useState<string>(
    user?.profileImage ? `http://localhost:3001${user.profileImage}` : ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection or drop
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Simulate upload and update
  const handleProfileImageUpdate = async () => {
    if (!imageFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('id', user?.id || '');
    formData.append('profileImage', imageFile);

    const res = await fetch('http://localhost:3001/api/update-profile', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (data.success && data.profileImage) {
      const updatedUser = { ...user, profileImage: data.profileImage };
      localStorage.setItem('blitz_scan_user', JSON.stringify(updatedUser));
      setUser && setUser(updatedUser);
      alert('Foto de perfil actualizada');
      onClose();
    } else {
      alert(data.message);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:3001/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user?.id, ...passwords }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('Contraseña actualizada');
      onClose();
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-6 text-center">Configuración de Cuenta</h2>
        {/* Foto de perfil */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-28 h-28 rounded-full border-4 border-blue-400 bg-gray-100 flex items-center justify-center overflow-hidden mb-2 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            title="Haz clic o arrastra una imagen"
          >
            {profileImage ? (
              <img src={profileImage} alt="Foto de perfil" className="object-cover w-full h-full" />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={handleProfileImageUpdate}
            disabled={!imageFile || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Actualizando...' : 'Actualizar Foto'}
          </button>
        </div>

        {/* Cambiar contraseña */}
        <div className="border-t pt-6">
          <button
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors mb-4"
          >
            Cambiar Contraseña
          </button>
          {showPasswordFields && (
            <div className="space-y-4">
             <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  placeholder="Contraseña actual"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 text-gray-900 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-blue-500 focus:outline-none"
                  onClick={() => setShowOldPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showOldPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />  
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 text-gray-900 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-blue-500 focus:outline-none"
                  onClick={() => setShowNewPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />  
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={!passwords.oldPassword || !passwords.newPassword || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}