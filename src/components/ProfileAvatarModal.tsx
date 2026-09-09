import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { Camera, Upload, Check, RotateCcw, X, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'polygon',
    name: 'Original 3D',
    url: 'polygon',
  },
  {
    id: 'avatar-1',
    name: 'Trader Pro',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Executive',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    name: 'Crypto Lady',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Smart Casual',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    name: 'VIP Elite',
    url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&auto=format&fit=crop&q=80',
  },
];

export const ProfileAvatarModal: React.FC<ProfileAvatarModalProps> = ({ isOpen, onClose }) => {
  const { user, updateAvatar, language, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'change'>('change');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateAvatar(reader.result);
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read image file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-100 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
          <h3 className="text-sm font-bold text-neutral-900">
            Personal Avatar & Profile
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="py-4 flex-1 overflow-y-auto flex flex-col items-center text-center no-scrollbar">
          {/* Main User Avatar with Camera action button */}
          <div className="relative group my-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-white border-2 border-neutral-200 p-1.5 flex items-center justify-center shadow-md cursor-pointer relative overflow-hidden transition-all hover:scale-102 hover:border-amber-400"
              title="Click to upload custom picture"
            >
              <UserAvatar avatar={user.avatar} size={84} />
              
              {/* Overlay on hover/tap */}
              <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={22} className="text-white drop-shadow" />
                <span className="text-[9px] font-bold text-white mt-1">Change</span>
              </div>
            </div>

            {/* Camera Badge in bottom right */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white"
              title="Upload new photo"
            >
              <Camera size={15} />
            </button>
          </div>

          <h4 className="font-bold text-base text-neutral-900 mt-2">{user.username}</h4>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">UID: 9812409</p>

          <div className="mt-2.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            VIP Tier: Level {user.vipLevel}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Picture Change Options Section */}
          <div className="w-full mt-4 pt-3 border-t border-neutral-100 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                <Sparkles size={13} className="text-amber-500" />
                <span>{isBn ? 'প্রোফাইল পিকচার পরিবর্তন করুন' : 'Change Profile Picture'}</span>
              </span>
            </div>

            {/* Action Buttons: Upload custom file & Reset */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 hover:from-amber-600 hover:to-amber-700 active:scale-97 transition-all cursor-pointer shadow-2xs"
              >
                <Upload size={14} />
                <span>{isUploading ? 'Uploading...' : (isBn ? 'গ্যালারি থেকে ছবি' : 'Upload Image')}</span>
              </button>

              <button
                onClick={() => updateAvatar('polygon')}
                className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center space-x-1.5 active:scale-97 transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset Default'}</span>
              </button>
            </div>

            {/* Quick Select Presets */}
            <p className="text-[11px] font-semibold text-neutral-500 mb-2">
              {isBn ? 'অথবা অবতার নির্বাচন করুন:' : 'Or choose an avatar:'}
            </p>

            <div className="grid grid-cols-4 gap-2">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = user.avatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => updateAvatar(preset.url)}
                    className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-50 flex items-center justify-center mb-1">
                      <UserAvatar avatar={preset.url} size={42} />
                    </div>
                    <span className="text-[9.5px] font-medium text-neutral-700 truncate w-full text-center">
                      {preset.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Close button matching screenshot */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 mt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
};
