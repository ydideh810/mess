import React, { useState, useEffect } from 'react';
import { UserPlus, QrCode, Camera, ArrowLeft, Phone, Video, Image, Film, Mic } from 'lucide-react';
import { ContactList } from './ContactList';
import { MessageThread } from './MessageThread';
import { MessageComposer } from './MessageComposer';
import { AddContactModal } from './AddContactModal';
import { QRScanner } from './QRScanner';
import { ProfileQRCode } from './ProfileQRCode';
import { useContacts } from '../../hooks/useContacts';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useP2PMessaging } from '../../hooks/useP2PMessaging';
import { Contact } from '../../types/message';

export function MessagingInterface() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showContactList, setShowContactList] = useState(!isMobileView);

  const { contacts, loadContacts, saveContact, deleteContact } = useContacts();
  const { profile } = useUserProfile();
  const { sendMessage, sendMediaMessage } = useP2PMessaging();

  useEffect(() => {
    loadContacts();
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setShowContactList(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loadContacts]);

  const handleSendMessage = async (content: string) => {
    if (selectedContact && content.trim()) {
      await sendMessage(content, selectedContact.id);
    }
  };

  const handleSendMedia = async (file: File, type: 'image' | 'video') => {
    if (!selectedContact) return;
    await sendMediaMessage(file, type, selectedContact.id);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Contacts Panel */}
      <div className={`
        ${isMobileView ? 'fixed inset-0 z-10 bg-black' : 'w-64 border-r border-[#00ff9d]'}
        ${showContactList || !isMobileView ? 'block' : 'hidden'}
      `}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="terminal-text text-xs">CONTACTS</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="terminal-button p-1"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowQRCode(true)}
                className="terminal-button p-1"
              >
                <QrCode className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowAddContact(true)}
                className="terminal-button p-1"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ContactList
            contacts={contacts}
            onSelectContact={(contact) => {
              setSelectedContact(contact);
              if (isMobileView) setShowContactList(false);
            }}
            onDeleteContact={deleteContact}
            selectedContactId={selectedContact?.id}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 flex flex-col h-full
        ${isMobileView && showContactList ? 'hidden' : 'block'}
      `}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#00ff9d]">
              {isMobileView && (
                <button
                  onClick={() => setShowContactList(true)}
                  className="terminal-button p-1 mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h2 className="terminal-text text-xs">CHAT WITH {selectedContact.name}</h2>
              <div className="flex gap-2">
                <button className="terminal-button p-2">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="terminal-button p-2">
                  <Video className="h-4 w-4" />
                </button>
                <button className="terminal-button p-2">
                  <Image className="h-4 w-4" />
                </button>
                <button className="terminal-button p-2">
                  <Film className="h-4 w-4" />
                </button>
                <button className="terminal-button p-2">
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto">
              <MessageThread
                messages={[]}
                currentUserId={profile?.id || ''}
              />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#00ff9d] bg-black">
              <MessageComposer
                onSendMessage={handleSendMessage}
                onSendMedia={handleSendMedia}
                recipientName={selectedContact.name}
              />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="terminal-text text-xs text-[#00ff9d]/70">
              Select a contact to start messaging
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onSave={saveContact}
        />
      )}

      {showScanner && (
        <QRScanner
          onScan={(data) => {
            saveContact(data);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showQRCode && profile && (
        <ProfileQRCode
          qrCode={profile.qrCode}
          publicKey={profile.publicKey}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
}