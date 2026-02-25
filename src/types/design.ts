export interface DesignRequest {
    id: string;
    userId: string;
    designerId: string;
    customerName?: string;
    specialNotes?: string;
    room: {
        width: number;
        length: number;
        height: number;
        wallColor: string;
        floorColor: string;
    };
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: string;
    updatedAt: string;
    designId?: string; // Link to the completed design
}
