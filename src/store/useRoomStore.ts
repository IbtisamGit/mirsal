import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Room {
  id: string;
  room_code: string;
  owner_id: string;
  is_quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  is_active?: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  room_id: string;
  display_name: string;
  role: 'owner' | 'admin' | 'member' | 'child';
  pin: string;
  avatar_url: string | null;
  created_at: string;
}

interface RoomState {
  rooms: Room[];
  members: Record<string, Member[]>;
  isLoading: boolean;
  fetchRooms: () => Promise<void>;
  createRoom: (password: string) => Promise<void>;
  fetchMembers: (roomId: string) => Promise<void>;
  addMember: (roomId: string, name: string, role: 'owner' | 'admin' | 'child', pin: string) => Promise<void>;
  deleteMember: (roomId: string, memberId: string) => Promise<void>;
  updateQuietHours: (roomId: string, enabled: boolean, start: string | null, end: string | null) => Promise<void>;
  updateRoomPassword: (roomId: string, newPassword: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  toggleRoomStatus: (roomId: string, isActive: boolean) => Promise<void>;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  members: {},
  isLoading: false,

  fetchRooms: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Fetch rooms owned by the user
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ rooms: data as Room[] });

      // Fetch members for these rooms
      for (const room of data) {
        await get().fetchMembers(room.id);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createRoom: async (password: string) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Generate a simple 6-character room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          room_password: password,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      const ownerName = user.user_metadata?.full_name || 'المالك';
      const ownerAvatar = user.user_metadata?.avatar_url || null;
      
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert({
          room_id: data.id,
          display_name: ownerName,
          avatar_url: ownerAvatar,
          role: 'owner',
          pin: '0000'
        })
        .select()
        .single();

      if (memberError) console.error("Failed to auto-add owner member:", memberError);
      
      set((state) => ({ 
        rooms: [data as Room, ...state.rooms],
        members: {
          ...state.members,
          [data.id]: memberData ? [memberData as any] : []
        }
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMembers: async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      set((state) => ({
        members: {
          ...state.members,
          [roomId]: data as Member[]
        }
      }));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  },

  addMember: async (roomId: string, name: string, role: 'owner' | 'admin' | 'child', pin: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('members')
        .insert({
          room_id: roomId,
          display_name: name,
          role: role,
          pin: pin
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('هذا الاسم موجود مسبقاً في الغرفة');
        throw error;
      }

      set((state) => ({
        members: {
          ...state.members,
          [roomId]: [...(state.members[roomId] || []), data as Member]
        }
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMember: async (roomId: string, memberId: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      set((state) => ({
        members: {
          ...state.members,
          [roomId]: state.members[roomId].filter(m => m.id !== memberId)
        }
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuietHours: async (roomId: string, enabled: boolean, start: string | null, end: string | null) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          is_quiet_hours_enabled: enabled,
          quiet_hours_start: start,
          quiet_hours_end: end
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        rooms: state.rooms.map(room => room.id === roomId ? data as Room : room)
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoomPassword: async (roomId: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          room_password: newPassword
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      
      // Update the room in state if needed
      set((state) => ({
        rooms: state.rooms.map(room => room.id === roomId ? data as Room : room)
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRoom: async (roomId: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;
      
      set((state) => ({
        rooms: state.rooms.filter(room => room.id !== roomId),
        // Clean up members from local state to avoid memory leaks
        members: Object.fromEntries(Object.entries(state.members).filter(([key]) => key !== roomId))
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  toggleRoomStatus: async (roomId: string, isActive: boolean) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ is_active: isActive })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        rooms: state.rooms.map(room => room.id === roomId ? data as Room : room)
      }));
    } finally {
      set({ isLoading: false });
    }
  }
}));
