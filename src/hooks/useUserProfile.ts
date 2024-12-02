import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import QRCode from 'qrcode';
import { generateKeyPair } from '../utils/cryptoUtils';

const USER_PROFILE_KEY = 'saxiib_user_profile';

interface UserProfile {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string;
  qrCode: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      let userProfile = await get(USER_PROFILE_KEY);
      
      if (!userProfile) {
        // Generate new profile for first-time users
        const { publicKey, secretKey } = generateKeyPair();
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        userProfile = {
          id,
          name: `User_${id.substring(0, 8)}`,
          publicKey,
          secretKey,
          qrCode: ''
        };

        // Generate QR code
        const qrData = JSON.stringify({
          id: userProfile.id,
          name: userProfile.name,
          publicKey: userProfile.publicKey
        });

        userProfile.qrCode = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#00ff9d',
            light: '#000000',
          },
        });

        await set(USER_PROFILE_KEY, userProfile);
      }

      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const updateProfile = async (name: string) => {
    if (!profile) return;

    try {
      const updatedProfile = { ...profile, name };
      
      // Update QR code with new name
      const qrData = JSON.stringify({
        id: updatedProfile.id,
        name: updatedProfile.name,
        publicKey: updatedProfile.publicKey
      });

      updatedProfile.qrCode = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#00ff9d',
          light: '#000000',
        },
      });

      await set(USER_PROFILE_KEY, updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return {
    profile,
    updateProfile
  };
}