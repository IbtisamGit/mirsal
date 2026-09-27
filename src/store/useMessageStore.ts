import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  room_id: string;
  member_id: string;
  content: string;
  message_type: 'text' | 'drawing' | 'ping';
  created_at: string;
  members?: {
    display_name: string;
    role: string;
    avatar_url?: string;
  };
}

export interface OnlineUser {
  memberId: string;
  displayName: string;
  avatarUrl?: string;
}

interface MessageState {
  messages: Message[];
  onlineUsers: OnlineUser[];
  isLoading: boolean;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, memberId: string, content: string, type?: 'text' | 'drawing' | 'ping') => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  subscribeToRoom: (roomId: string, currentUser: OnlineUser) => void;
  unsubscribeFromRoom: () => void;
}

let roomChannel: any = null;

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  onlineUsers: [],
  isLoading: false,

  fetchMessages: async (roomId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          members (
            display_name,
            role,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      set({ messages: data as Message[] });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (roomId: string, memberId: string, content: string, type = 'text') => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          member_id: memberId,
          content,
          message_type: type
        });

      if (error) throw error;
      // Note: We don't manually add to state here because the realtime subscription will catch it
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToRoom: (roomId: string, currentUser: OnlineUser) => {
    // Unsubscribe if already subscribed to prevent duplicates
    get().unsubscribeFromRoom();

    roomChannel = supabase.channel(`room_${roomId}`, {
      config: {
        presence: {
          key: currentUser.memberId,
        },
      },
    });

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = roomChannel.presenceState();
        const online: OnlineUser[] = [];
        for (const key in presenceState) {
          online.push(presenceState[key][0] as OnlineUser);
        }
        set({ onlineUsers: online });
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload: any) => {
          // Fetch the member details for the new message to display name correctly
          const { data: memberData } = await supabase
            .from('members')
            .select('display_name, role, avatar_url')
            .eq('id', payload.new.member_id)
            .single();

          const newMessage = {
            ...payload.new,
            members: memberData
          } as Message;

          set((state) => {
            // Prevent duplicate insertions
            if (state.messages.some(m => m.id === newMessage.id)) return state;
            return { messages: [...state.messages, newMessage] };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload: any) => {
          set((state) => ({
            messages: state.messages.filter(m => m.id !== payload.old.id)
          }));
        }
      )
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await roomChannel.track(currentUser);
        }
      });
  },

  unsubscribeFromRoom: () => {
    if (roomChannel) {
      supabase.removeChannel(roomChannel);
      roomChannel = null;
      set({ onlineUsers: [] });
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) throw error;
      set((state) => ({ messages: state.messages.filter(m => m.id !== messageId) }));
    } catch (e) {
      console.error('Error deleting message:', e);
      throw e;
    }
  }
}));
