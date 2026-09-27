import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ChildSession {
  roomId: string;
  memberId: string;
  displayName: string;
  roomCode: string;
  avatarUrl?: string;
}

interface ChatState {
  session: ChildSession | null;
  isLoading: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  hydrateSession: () => void;
  saveSession: (session: ChildSession) => void;
  clearSession: () => void;
  verifyAndResumeSession: () => Promise<boolean>;
  getRoomMembers: (roomCode: string, roomPassword?: string) => Promise<any[] | null>;
  login: (roomCode: string, memberId: string, pin: string) => Promise<boolean>;
}

const SESSION_KEY = 'mirsal_child_session';

export const useChatStore = create<ChatState>((set, get) => ({
  session: null,
  isLoading: false,
  status: 'idle',
  error: null,

  hydrateSession: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        set({ session: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to parse session:', error);
      localStorage.removeItem(SESSION_KEY);
    }
  },

  saveSession: (session: ChildSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ session: null });
  },

  verifyAndResumeSession: async () => {
    const { session, clearSession } = get();
    if (!session) return false;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, room_id')
        .eq('id', session.memberId)
        .single();

      if (error || !data) throw new Error('Member not found');
      if (data.room_id !== session.roomId) throw new Error('Room mismatch');

      return true;
    } catch (error) {
      clearSession();
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  getRoomMembers: async (roomCode: string, roomPassword?: string) => {
    set({ status: 'loading', error: null });
    try {
      // Step 1: Verify Room Code AND Password
      let query = supabase.from('rooms').select('id, room_password').eq('room_code', roomCode).single();
      
      const { data: room, error: roomError } = await query;

      if (roomError || !room) {
        throw new Error('رمز الغرفة غير صحيح');
      }

      if (room.room_password && room.room_password !== roomPassword) {
         throw new Error('كلمة مرور الغرفة غير صحيحة');
      }

      // Step 2: Fetch Members exactly for this room
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, display_name, role, avatar_url')
        .eq('room_id', room.id)
        .order('display_name', { ascending: true });

      if (membersError) throw membersError;

      set({ status: 'success' });
      return members;
    } catch (error: any) {
      set({ status: 'error', error: error.message });
      return null;
    }
  },

  login: async (roomCode: string, memberId: string, pin: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!room) throw new Error('رمز الغرفة غير صحيح');

      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .eq('room_id', room.id)
        .eq('pin', pin)
        .single();

      if (memberError || !member) {
        throw new Error('الرمز السري غير صحيح');
      }

      // Successful login -> Save to localstorage
      const newSession: ChildSession = {
        roomId: room.id,
        memberId: member.id,
        displayName: member.display_name,
        roomCode: roomCode,
        avatarUrl: member.avatar_url
      };
      
      get().saveSession(newSession);
      set({ status: 'success' });
      return true;

    } catch (error: any) {
      set({ status: 'error', error: error.message });
      return false;
    }
  }
}));
