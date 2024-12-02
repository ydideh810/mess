import { useState, useCallback, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { Message } from '../types/message';
import Peer from 'peerjs';
import { notificationService } from '../services/notificationService';

const MESSAGES_STORE_KEY = 'saxiib_messages';

export function useP2PMessaging() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>('');

  useEffect(() => {
    initPeer();
    loadMessages();
    return () => {
      peer?.disconnect();
    };
  }, []);

  const initPeer = () => {
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      console.log('My peer ID is:', id);
      setPeerId(id);
    });

    newPeer.on('connection', (conn) => {
      conn.on('data', async (data: any) => {
        if (data.type === 'message') {
          const message: Message = {
            id: `msg_${Date.now()}`,
            senderId: conn.peer,
            receiverId: peerId,
            content: data.content,
            timestamp: new Date(),
            status: 'received',
            type: 'text'
          };

          const updatedMessages = [...messages, message];
          await set(MESSAGES_STORE_KEY, updatedMessages);
          setMessages(updatedMessages);

          // Show notification
          notificationService.notifyNewMessage('Contact', data.content);
        }
      });
    });

    setPeer(newPeer);
  };

  const loadMessages = async () => {
    try {
      const stored = await get(MESSAGES_STORE_KEY) || [];
      setMessages(stored.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = useCallback(async (
    content: string,
    recipientId: string
  ): Promise<Message | null> => {
    if (!peer || !peerId) return null;

    try {
      const conn = peer.connect(recipientId);
      
      conn.on('open', () => {
        conn.send({
          type: 'message',
          content
        });
      });

      const message: Message = {
        id: `msg_${Date.now()}`,
        senderId: peerId,
        receiverId: recipientId,
        content,
        timestamp: new Date(),
        status: 'sent',
        type: 'text'
      };

      const updatedMessages = [...messages, message];
      await set(MESSAGES_STORE_KEY, updatedMessages);
      setMessages(updatedMessages);

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }, [peer, peerId, messages]);

  const sendMediaMessage = useCallback(async (
    file: File,
    type: 'image' | 'video' | 'voice',
    recipientId: string
  ): Promise<Message | null> => {
    if (!peer || !peerId) return null;

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const conn = peer.connect(recipientId);
        
        conn.on('open', () => {
          conn.send({
            type: 'media',
            mediaType: type,
            content: reader.result
          });
        });

        const message: Message = {
          id: `msg_${Date.now()}`,
          senderId: peerId,
          receiverId: recipientId,
          content: reader.result as string,
          timestamp: new Date(),
          status: 'sent',
          type
        };

        const updatedMessages = [...messages, message];
        await set(MESSAGES_STORE_KEY, updatedMessages);
        setMessages(updatedMessages);
      };

      return null;
    } catch (error) {
      console.error('Failed to send media:', error);
      return null;
    }
  }, [peer, peerId, messages]);

  return {
    peerId,
    messages,
    sendMessage,
    sendMediaMessage
  };
}