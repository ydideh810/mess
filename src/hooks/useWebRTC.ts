import { notificationService } from '../services/notificationService';

// ... existing imports ...

export function useWebRTC(userId: string) {
  // ... existing code ...

  const handleIncomingCall = async (call: any) => {
    try {
      // Show notification for incoming call
      notificationService.notifyIncomingCall(call.peer);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setState(prev => ({ ...prev, localStream: stream }));
      call.answer(stream);

      call.on('stream', (remoteStream: MediaStream) => {
        setState(prev => ({
          ...prev,
          remoteStream,
          isConnected: true,
        }));
      });
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  // ... rest of the code ...
}