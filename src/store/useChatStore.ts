import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message, Room, Member } from '../types';

interface Session {
  roomId: string;
  memberId: string;
  displayName: string;
}

interface ChatState {
  session: Session | null;
  messages: Message[];
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  error: string | null;
  
  // Actions
  hydrateSession: () => void;
  login: (roomCode: string, memberId: string, pin: string) => Promise<boolean>;
  getRoomMembers: (roomCode: string) => Promise<Member[] | null>;
  logout: () => void;
  
  // Chat Actions
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  session: null,
  messages: [],
  status: 'idle',
  error: null,

  hydrateSession: () => {
    const roomId = localStorage.getItem('mirsal_room_id');
    const memberId = localStorage.getItem('mirsal_member_id');
    const displayName = localStorage.getItem('mirsal_display_name');

    if (roomId && memberId && displayName) {
      set({ session: { roomId, memberId, displayName } });
    }
  },

  getRoomMembers: async (roomCode: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) {
        set({ status: 'error', error: 'رمز الغرفة غير صحيح' });
        return null;
      }

      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('room_id', room.id);

      if (membersError) {
        set({ status: 'error', error: 'فشل في جلب الأعضاء' });
        return null;
      }

      set({ status: 'idle' });
      return members;
    } catch (err: any) {
      set({ status: 'error', error: err.message });
      return null;
    }
  },

  login: async (roomCode: string, memberId: string, pin: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*, rooms(room_code)')
        .eq('id', memberId)
        .eq('passcode', pin)
        .single();

      if (error || !member) {
        set({ status: 'error', error: 'الرمز السري غير صحيح' });
        return false;
      }

      const sessionData = {
        roomId: member.room_id,
        memberId: member.id,
        displayName: member.display_name,
      };

      localStorage.setItem('mirsal_room_id', sessionData.roomId);
      localStorage.setItem('mirsal_member_id', sessionData.memberId);
      localStorage.setItem('mirsal_display_name', sessionData.displayName);

      set({ session: sessionData, status: 'success' });
      return true;
    } catch (err: any) {
      set({ status: 'error', error: 'حدث خطأ أثناء تسجيل الدخول' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('mirsal_room_id');
    localStorage.removeItem('mirsal_member_id');
    localStorage.removeItem('mirsal_display_name');
    set({ session: null, messages: [], status: 'idle' });
    get().unsubscribeFromMessages();
  },

  fetchMessages: async () => {
    const { session } = get();
    if (!session) return;

    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, members(display_name)')
        .eq('room_id', session.roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ 
        messages: data as Message[], 
        status: data.length === 0 ? 'empty' : 'success' 
      });
    } catch (err: any) {
      set({ status: 'error', error: 'فشل في جلب الرسائل' });
    }
  },

  sendMessage: async (content: string) => {
    const { session } = get();
    if (!session || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: session.roomId,
          member_id: session.memberId,
          content: content.trim()
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error sending message:', err);
    }
  },

  addMessage: async (message: Message) => {
    // Fetch member details if not present (since realtime payload might lack joins)
    if (!message.members) {
       const { data: memberData } = await supabase
         .from('members')
         .select('display_name')
         .eq('id', message.member_id)
         .single();
       
       if (memberData) {
         message.members = { display_name: memberData.display_name };
       }
    }

    set((state) => ({ 
      messages: [...state.messages, message],
      status: 'success'
    }));
  },

  subscribeToMessages: () => {
    const { session, addMessage } = get();
    if (!session) return;

    supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${session.roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          addMessage(newMessage);
        }
      )
      .subscribe();
  },

  unsubscribeFromMessages: () => {
    supabase.removeAllChannels();
  },
}));
