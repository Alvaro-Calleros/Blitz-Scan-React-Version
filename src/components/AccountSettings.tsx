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
              <span className="text-4xl text-blue-400">+</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={handleProfileImageUpdate}
            disabled={loading || !imageFile}
          >
            {loading ? 'Guardando...' : 'Guardar Foto'}
          </button>
          <p className="text-xs text-gray-500 mt-1">Haz clic o arrastra una imagen para cambiar tu foto</p>
        </div>
        {/* Cambiar contraseña */}
        <div className="mb-6">
          <button
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-blue-100 transition mb-2"
            onClick={() => setShowPasswordFields((v) => !v)}
          >
            Cambiar Contraseña
          </button>
          {showPasswordFields && (
            <div className="mt-2 space-y-2 animate-fade-in">
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                placeholder="Contraseña actual"
                className="input"
              />
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Nueva contraseña"
                className="input"
              />
              <button
                onClick={handlePasswordChange}
                disabled={loading || !passwords.oldPassword || !passwords.newPassword}
                className="btn-primary w-full mt-2"
              >
                {loading ? 'Guardando...' : 'Guardar Contraseña'}
              </button>
            </div>
          )}
        </div>
        <button onClick={onClose} className="btn w-full mt-2">Cerrar</button>
      </div>
    </div>
  );
}