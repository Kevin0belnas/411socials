import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUserCircle, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

const API_URL = import.meta.env.VITE_API_URL;

const AgentChat = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const hasSentWelcomeMessage = useRef({}); // Track which chats have received welcome message

  // Format timestamp function
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return '';
    }
  };

  // Fetch agent info on mount
  useEffect(() => {
    const fetchCurrentAgent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/current-agents`, { credentials: 'include' });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching current agent:', error);
      }
    };

    fetchCurrentAgent();
  }, []);

  // Fetch active chats only once on mount
  useEffect(() => {
    const fetchActiveChats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agent/chats`, { credentials: 'include' });
        const data = await response.json();
        setActiveChats(data.chats);
        if (!selectedChat && data.chats.length > 0) {
          setSelectedChat(data.chats[0].email);
        }
      } catch (error) {
        console.error('Error fetching active chats:', error);
      }
    };

    fetchActiveChats();
  }, []);

  // Send welcome message when first message is received
  const sendWelcomeMessage = async (chatEmail, firstMessageContent) => {
  // Extra safety check
  if (hasSentWelcomeMessage.current[chatEmail]) return;
  
  try {
    const welcomeMessage = `Hello! My name is ${user?.name || 'Agent'}. I'll be assisting you with "${firstMessageContent}". How can I help you today?`;
    
    const response = await fetch(`${API_URL}/api/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        email: chatEmail, 
        message: welcomeMessage, 
        isAgent: true,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      // Mark this chat as having received welcome message
      hasSentWelcomeMessage.current[chatEmail] = true;
      
      // Update local state
      setActiveChats(prevChats => 
        prevChats.map(chat => 
          chat.email === chatEmail
            ? { 
                ...chat, 
                messages: [
                  ...(chat.messages || []), 
                  {
                    message: welcomeMessage,
                    isAgent: true,
                    timestamp: new Date().toISOString()
                  }
                ] 
              }
            : chat
        )
      );
    }
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
};

  // Fetch messages for selected chat when it changes
  useEffect(() => {
    if (!selectedChat) return;

    let intervalId;

    // In the fetchMessages function inside the useEffect for selectedChat:
const fetchMessages = async () => {
  try {
    const response = await fetch(`${API_URL}/api/chat/messages?email=${selectedChat}`, {
      credentials: 'include',
    });
    const data = await response.json();
    
    // Improved welcome message logic
    if (data.messages?.length > 0 && !hasSentWelcomeMessage.current[selectedChat]) {
      const hasAgentMessages = data.messages.some(msg => msg.isAgent);
      const firstClientMessage = data.messages.find(msg => !msg.isAgent);
      
      if (firstClientMessage && !hasAgentMessages) {
        await sendWelcomeMessage(selectedChat, firstClientMessage.message);
        return;
      }
    }

    setActiveChats(prevChats =>
      prevChats.map(chat =>
        chat.email === selectedChat
          ? { ...chat, messages: data.messages }
          : chat
      )
    );
    // scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

    fetchMessages(); // Fetch initially

    // Start polling every 3 seconds
    intervalId = setInterval(fetchMessages, 3000);

    // Clean up interval when chat changes or component unmounts
    return () => clearInterval(intervalId);
  }, [selectedChat, user?.name]);

  // const scrollToBottom = () => {
  //   setTimeout(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //   }, 50);
  // };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: selectedChat, 
          message, 
          isAgent: true,
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        setMessage('');
        // Fetch updated messages after sending
        const updatedResponse = await fetch(`${API_URL}/api/chat/messages?email=${selectedChat}`, { 
          credentials: 'include' 
        });
        const updatedData = await updatedResponse.json();
        setActiveChats(prevChats => 
          prevChats.map(chat => 
            chat.email === selectedChat 
              ? { ...chat, messages: updatedData.messages } 
              : chat
          )
        );
        // scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = activeChats.filter(chat => 
    chat.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (chat.name && chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentChat = activeChats.find(chat => chat.email === selectedChat);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatarContainer}>
              <FaUserCircle style={styles.userAvatar} />
            </div>
            <div>
              <div style={styles.userName}>{user?.name || 'Agent'}</div>
              <div style={styles.userStatus}>
                <span style={styles.statusIndicator}></span> Online
              </div>
            </div>
          </div>
        </div>

        <div style={styles.searchContainer}>
          <div style={styles.searchInner}>
            <FaSearch style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>
        </div>

        <div style={styles.chatList}>
          {filteredChats.map((chat) => (
            <div 
              key={chat.email} 
              style={{ 
                ...styles.chatItem, 
                ...(selectedChat === chat.email ? styles.activeChatItem : {}) 
              }} 
              onClick={() => setSelectedChat(chat.email)}
            >
              <div style={styles.chatAvatar}>
                <div style={styles.avatarInitial}>
                  {chat.name ? chat.name.charAt(0).toUpperCase() : chat.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div style={styles.chatInfo}>
                <div style={styles.chatName}>{chat.name || chat.email}</div>
                <div style={styles.chatPreview}>
                  {chat.messages?.[chat.messages.length - 1]?.message || 'No messages yet'}
                </div>
              </div>
              {chat.unreadCount > 0 && (
                <div style={styles.unreadBadge}>
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chatArea}>
        {selectedChat ? (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderInfo}>
                <div style={styles.chatTitle}>{currentChat?.name || currentChat?.email}</div>
                <div style={styles.chatStatus}>
                  <span style={{
                    ...styles.statusIndicator,
                    backgroundColor: currentChat?.isOnline ? '#4CAF50' : '#888'
                  }}></span>
                  {currentChat?.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            <div style={styles.messagesContainer}>
              {currentChat?.messages?.length === 0 ? (
                <div style={styles.emptyChat}>
                  <FaEnvelope style={styles.emptyChatIcon} />
                  <div style={styles.emptyChatText}>No messages yet</div>
                  <div style={styles.emptyChatSubtext}>Start the conversation</div>
                </div>
              ) : (
                currentChat?.messages?.map((msg, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      ...styles.message, 
                      ...(msg.isAgent ? styles.agentMessage : styles.clientMessage) 
                    }}
                  >
                    <div style={styles.messageContent}>{msg.message}</div>
                    <div style={styles.messageTime}>
                      {formatTimestamp(msg.timestamp)}
                      {msg.isAgent && <span style={styles.readReceipt}>✓✓</span>}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.messageInputContainer}>
              <div style={styles.inputWrapper}>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  placeholder="Type a message..." 
                  style={styles.messageInput} 
                  disabled={loading} 
                  rows="1"
                />
                <button 
                  onClick={handleSendMessage} 
                  style={styles.sendButton} 
                  disabled={loading || !message.trim()}
                >
                  <IoMdSend style={{ fontSize: '18px' }} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.noChatSelected}>
            <FaEnvelope style={styles.noChatIcon} />
            <div style={styles.noChatText}>Select a chat to start messaging</div>
            <div style={styles.noChatSubtext}>Choose from your active conversations</div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f5f7fb',
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
  },
  sidebar: {
    width: '350px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e1e4e8',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0,0,0,0.03)',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #eaeaea',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: '12px',
  },
  userAvatar: {
    fontSize: '40px',
    color: '#00c298',
  },
  userName: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#2d3748',
  },
  userStatus: {
    fontSize: '13px',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    marginTop: '3px',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    marginRight: '6px',
  },
  searchContainer: {
    padding: '15px 20px',
    borderBottom: '1px solid #eaeaea',
    width: '70%',
  },
  searchInner: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '12px',
    color: '#a0aec0',
    fontSize: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px 10px 40px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s',
    ':focus': {
      backgroundColor: '#fff',
      borderColor: '#5e72e4',
      boxShadow: '0 0 0 2px rgba(94, 114, 228, 0.1)',
    },
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e0 transparent',
    width: '97%',
  },
  chatItem: {
    display: 'flex',
    padding: '15px 20px',
    borderBottom: '1px solid #f0f4f8',
    cursor: 'pointer',
    alignItems: 'center',
    transition: 'background 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
    },
  },
  activeChatItem: {
    backgroundColor: '#f0f7ff',
    borderLeft: '3px solid #5e72e4',
  },
  chatAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#5e72e4',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    fontSize: '16px',
    fontWeight: '600',
  },
  avatarInitial: {
    transform: 'translateY(1px)',
  },
  chatInfo: {
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
  },
  chatName: {
    fontWeight: '600',
    fontSize: '15px',
    marginBottom: '3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#2d3748',
  },
  chatPreview: {
    fontSize: '13px',
    color: '#718096',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  unreadBadge: {
    backgroundColor: '#f56565',
    color: '#fff',
    borderRadius: '10px',
    minWidth: '20px',
    height: '20px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f7fb',
    minHeight: '0',
  },
  chatHeader: {
    padding: '18px 25px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  chatHeaderInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  chatTitle: {
    fontWeight: '600',
    fontSize: '17px',
    color: '#2d3748',
    marginBottom: '3px',
  },
  chatStatus: {
    fontSize: '13px',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: '20px 25px',
    overflowY: 'auto',
    backgroundImage: 'linear-gradient(#f5f7fb, #e6e9f2)',
    minHeight: '0',
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#a0aec0',
    textAlign: 'center',
  },
  emptyChatIcon: {
    fontSize: '60px',
    marginBottom: '15px',
    opacity: 0.5,
  },
  emptyChatText: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '5px',
  },
  emptyChatSubtext: {
    fontSize: '14px',
  },
  message: {
    maxWidth: '75%',
    marginBottom: '15px',
    padding: '12px 16px',
    borderRadius: '18px',
    position: 'relative',
    fontSize: '15px',
    lineHeight: '1.4',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  agentMessage: {
    backgroundColor: '#00c298',
    color: '#fff',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    borderBottomRightRadius: '4px',
  },
  clientMessage: {
    backgroundColor: '#ffffff',
    color: '#2d3748',
    alignSelf: 'flex-start',
    marginRight: 'auto',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  messageContent: {
    wordWrap: 'break-word',
  },
  messageTime: {
    fontSize: '11px',
    textAlign: 'right',
    marginTop: '6px',
    color: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  readReceipt: {
    marginLeft: '5px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
  },
  messageInputContainer: {
    padding: '15px 25px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '24px',
    padding: '8px 15px',
    border: '1px solid #e2e8f0',
  },
  messageInput: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '15px',
    maxHeight: '120px',
    backgroundColor: 'transparent',
    lineHeight: '1.4',
    scrollbarWidth: 'thin',
  },
  sendButton: {
    marginLeft: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#00c298',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':disabled': {
      backgroundColor: '#cbd5e0',
      cursor: 'not-allowed',
    },
    ':hover:not(:disabled)': {
      backgroundColor: '#4a5acf',
    },
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a0aec0',
    padding: '30px',
    textAlign: 'center',
  },
  noChatIcon: {
    fontSize: '70px',
    marginBottom: '20px',
    opacity: 0.3,
  },
  noChatText: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#4a5568',
  },
  noChatSubtext: {
    fontSize: '14px',
    maxWidth: '300px',
    lineHeight: '1.5',
  },
};

export default AgentChat;