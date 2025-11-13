import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Mock data for chat messages
const MOCK_CONTACTS = [
  { id: '1', name: 'Dr. Smith', role: 'Primary Care', lastSeen: 'Online', unread: 2 },
  { id: '2', name: 'Nurse Johnson', role: 'Home Care', lastSeen: '2h ago', unread: 0 },
  { id: '3', name: 'Family Group', role: '3 members', lastSeen: 'Active now', unread: 5 },
];

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status: 'sent' | 'delivered' | 'read';
};

type Contact = {
  id: string;
  name: string;
  role: string;
  lastSeen: string;
  unread: number;
};

const ChatScreen = () => {
  const { colors, isDark } = useTheme();
  const [activeChat, setActiveChat] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const flatListRef = useRef<FlatList>(null);

  // Mock function to load messages for a contact
  const loadMessages = (contactId: string) => {
    // In a real app, this would be an API call
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hello! How are you feeling today?',
        sender: 'them',
        time: '10:30 AM',
        status: 'read'
      },
      {
        id: '2',
        text: 'I\'m doing well, thank you for asking.',
        sender: 'me',
        time: '10:32 AM',
        status: 'read'
      },
      {
        id: '3',
        text: 'That\'s great to hear! Any symptoms I should know about?',
        sender: 'them',
        time: '10:33 AM',
        status: 'read'
      },
    ];
    setMessages(mockMessages);
  };

  const handleSend = () => {
    if (!message.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Auto-reply for demo purposes
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. I will get back to you soon!',
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered'
        };
        setMessages(prev => [...prev, reply]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      style={[
        styles.messageBubble,
        item.sender === 'me' 
          ? [styles.myMessage, { backgroundColor: colors.primary }]
          : [styles.theirMessage, { backgroundColor: colors.card }]
      ]}
    >
      <Text 
        style={[
          styles.messageText,
          { color: item.sender === 'me' ? 'white' : colors.text }
        ]}
      >
        {item.text}
      </Text>
      <View style={styles.messageMeta}>
        <Text 
          style={[
            styles.messageTime,
            { color: item.sender === 'me' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
          ]}
        >
          {item.time}
        </Text>
        {item.sender === 'me' && (
          <Ionicons 
            name={item.status === 'read' ? 'checkmark-done' : 'checkmark'} 
            size={16} 
            color={item.status === 'read' ? '#4FD1C5' : 'rgba(255,255,255,0.7)'} 
            style={styles.statusIcon}
          />
        )}
      </View>
    </View>
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={[
        styles.contactItem, 
        { 
          backgroundColor: activeChat?.id === item.id 
            ? isDark ? '#2D3748' : '#E2E8F0' 
            : 'transparent' 
        }
      ]}
      onPress={() => {
        setActiveChat(item);
        loadMessages(item.id);
      }}
    >
      <View style={styles.contactAvatar}>
        <Ionicons name="person" size={32} color="#4B5563" />
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.contactTime, { color: colors.textSecondary }]}>{item.lastSeen}</Text>
        </View>
        <Text style={[styles.contactRole, { color: colors.textSecondary }]}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (!activeChat) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.contactsHeader}>
          <Text style={[styles.contactsTitle, { color: colors.text }]}>Messages</Text>
        </View>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.chatHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveChat(null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={[styles.chatTitle, { color: colors.text }]}>{activeChat.name}</Text>
          <Text style={[styles.chatStatus, { color: colors.textSecondary }]}>
            {activeChat.lastSeen}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="videocam" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, { backgroundColor: colors.card }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableOpacity style={styles.attachmentButton}>
          <Ionicons name="attach" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.messageInput, 
            { 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border
            }
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              backgroundColor: message.trim() ? colors.primary : colors.border,
              opacity: message.trim() ? 1 : 0.7
            }
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={message.trim() ? 'white' : colors.textSecondary} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contactsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contactsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contactsList: {
    paddingBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactTime: {
    fontSize: 12,
  },
  contactRole: {
    fontSize: 14,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chatStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesList: {
    paddingVertical: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;
