import { RoomData, Room } from '@/lib/design-context';

export interface DesignRequest {
    id: string;
    userId: string;
    designerId: string;
    customerName?: string;
    specialNotes?: string;
    rooms?: RoomData[];
    room?: Room; // Legacy support
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: string;
    updatedAt: string;
    designId?: string;
}
