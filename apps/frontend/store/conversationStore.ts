import { Conversation, ConversationDropdownType, Message } from "@/utils";
import { create } from "zustand";

interface ConversationState {
  nextCursor: string | null;
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  setConversation: (targetUserId: string, conversation: Conversation) => void;
  setMessages: (conversationId: string, message: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  addOldMessages: (conversationId: string, messages: Message[]) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updatedMessage: Partial<Message>,
  ) => void;
  setNextCursor: (nextCursor: null | string) => void;
  clearConversations: () => void;
  hasNewMessageMap: Record<string, boolean>;
  setHasNewMessage: (conversationId: string, hasNewMessage: boolean) => void;
  conversationsDashboard: ConversationDropdownType[];
  setConversationsDashboard: (
    conversationsDashboard: ConversationDropdownType[],
  ) => void;
  selectedContact: string | null;
  setSelectedContact: (selectedContact: string | null) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: {},
  messages: {},
  nextCursor: null,
  hasNewMessageMap: {},
  conversationsDashboard: [],
  selectedContact: null,

  setSelectedContact: (selectedContact) =>
    set({
      selectedContact,
    }),

  setHasNewMessage: (conversationId, hasNewMessage) =>
    set((state) => ({
      hasNewMessageMap: {
        ...state.hasNewMessageMap,
        [conversationId]: hasNewMessage,
      },
    })),

  setConversation: (targetUserId, conversation) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [targetUserId]: conversation,
      },
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (msg) => msg.id !== messageId,
        ),
      },
    })),

  updateMessage: (conversationId, messageId, updatedMessage) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId].map((message) =>
          message.id === messageId
            ? { ...message, ...updatedMessage }
            : message,
        ),
      },
    })),

  addOldMessages: (conversationId, oldMessages) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...oldMessages, ...existingMessages],
        },
      };
    }),

  setNextCursor: (nextCursor) => set({ nextCursor }),

  clearConversations: () =>
    set({
      conversations: {},
      messages: {},
    }),

  setConversationsDashboard: (conversationsDashboard) =>
    set({
      conversationsDashboard,
    }),
}));
