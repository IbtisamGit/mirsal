export interface Room {
  id: string;
  room_code: string;
  created_at: string;
}

export interface Member {
  id: string;
  room_id: string;
  display_name: string;
  role: 'admin' | 'child' | 'mother';
  passcode: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  member_id: string;
  content: string;
  created_at: string;
  members?: {
    display_name: string;
  };
}
