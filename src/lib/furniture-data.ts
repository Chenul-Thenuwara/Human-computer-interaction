import { FurnitureItem } from './design-context';

export const furnitureLibrary: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>[] = [
    // Chairs
    /*
    {
        type: 'chair',
        name: 'Modern Dining Chair',
        width: 0.5,
        depth: 0.55,
        height: 0.85,
        color: '#8B4513',
        imageUrl: 'https://images.unsplash.com/photo-1758977403438-1b8546560d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkaW5pbmclMjBjaGFpciUyMHdvb2RlbnxlbnwxfHx8fDE3NzExNzEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'chair',
        name: 'Accent Chair',
        width: 0.75,
        depth: 0.8,
        height: 0.9,
        color: '#4A5568',
        imageUrl: 'https://images.unsplash.com/photo-1768573264026-b540abdc3384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NlbnQlMjBhcm1jaGFpciUyMHVwaG9sc3RlcmVkfGVufDF8fHx8MTc3MTE3MTA0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'chair',
        name: 'Office Chair',
        width: 0.6,
        depth: 0.6,
        height: 1.0,
        color: '#2D3748',
        imageUrl: 'https://images.unsplash.com/photo-1688578735122-f37256f1b8b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBjaGFpciUyMGVyZ29ub21pY3xlbnwxfHx8fDE3NzEwODk5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */
    {
        type: 'chair',
        name: 'Leather Armchair (3D)',
        width: 0.9,
        depth: 0.9,
        height: 0.9,
        color: '#8B4513',
        modelUrl: '/models/leather-chair.glb',
        imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYXJtY2hhaXJ8ZW58MXx8fHwxNzcxMTcxMDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'chair',
        name: 'Stool (3D)',
        width: 0.4,
        depth: 0.4,
        height: 0.45,
        color: '#A0826D',
        modelUrl: '/models/stool.glb',
        imageUrl: '/images/stool.png',
    },
    {
        type: 'chair',
        name: 'Concept Armchair (3D)',
        width: 0.9,
        depth: 0.9,
        height: 1.0,
        color: '#607D8B',
        modelUrl: '/models/arm-chair.glb',
        imageUrl: '/images/concept-armchair.png',
    },
    {
        type: 'chair',
        name: 'urban Armchair',
        width: 0.85,
        depth: 0.85,
        height: 0.95,
        color: '#2E7D32',
        modelUrl: '/models/green-arm-chai.glb',
        imageUrl: '/images/green-armchair.png',
    },


    // Dining Tables
    /*
    {
        type: 'dining-table',
        name: 'Rectangular Dining Table',
        width: 1.8,
        depth: 0.9,
        height: 0.75,
        color: '#654321',
        imageUrl: 'https://images.unsplash.com/photo-1652305459885-b7ae40f0d776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN0YW5ndWxhciUyMGRpbmluZyUyMHRhYmxlJTIwd29vZGVufGVufDF8fHx8MTc3MTE3MTA0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */
    {
        type: 'dining-table',
        name: 'Modern Table (3D)',
        width: 1.6,
        depth: 0.9,
        height: 0.75,
        color: '#fddddd',
        modelUrl: '/models/table2.glb',
        imageUrl: '/images/modern-table.png',
    },
    {
        type: 'dining-table',
        name: 'Study Desk (3D)',
        width: 1.2,
        depth: 0.6,
        height: 0.75,
        color: '#2D3748',
        modelUrl: '/models/study-desk.glb',
        imageUrl: '/images/study-desk.png',
    },
    /*
    {
        type: 'dining-table',
        name: 'Round Dining Table',
        width: 1.2,
        depth: 1.2,
        height: 0.75,
        color: '#8B7355',
        imageUrl: 'https://images.unsplash.com/photo-1687949289431-7dbbef0f872f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3VuZCUyMGRpbmluZyUyMHRhYmxlfGVufDF8fHx8MTc3MTE3MTA0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'dining-table',
        name: 'Extended Dining Table',
        width: 2.4,
        depth: 1.0,
        height: 0.75,
        color: '#6B4423',
        imageUrl: 'https://images.unsplash.com/photo-1762765685348-4bced247d12c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleHRlbmRlZCUyMGRpbmluZyUyMHRhYmxlfGVufDF8fHx8MTc3MTE3MTA0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */

    // Side Tables
    /*
    {
        type: 'side-table',
        name: 'Nightstand',
        width: 0.5,
        depth: 0.4,
        height: 0.6,
        color: '#A0826D',
        imageUrl: 'https://images.unsplash.com/photo-1637947148874-5549202425f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodHN0YW5kJTIwYmVkc2lkZSUyMHRhYmxlfGVufDF8fHx8MTc3MTE3MTA0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'side-table',
        name: 'Coffee Table',
        width: 1.2,
        depth: 0.6,
        height: 0.45,
        color: '#5C4033',
        imageUrl: 'https://images.unsplash.com/photo-1656699170530-21004fb9ec2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjB0YWJsZSUyMG1vZGVybnxlbnwxfHx8fDE3NzExNzEwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'side-table',
        name: 'Console Table',
        width: 1.0,
        depth: 0.35,
        height: 0.8,
        color: '#704214',
        imageUrl: 'https://images.unsplash.com/photo-1752061289543-de2e7720b029?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zb2xlJTIwdGFibGUlMjBlbnRyeXdheXxlbnwxfHx8fDE3NzExNzEwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */
    {
        type: 'side-table',
        name: 'Nightstand (3D)',
        width: 0.5,
        depth: 0.45,
        height: 0.6,
        color: '#8D6E63',
        modelUrl: '/models/nightstand.glb',
        imageUrl: '/images/nightstand.png',
    },


    // Sofas
    /*
    {
        type: 'sofa',
        name: '2-Seater Sofa',
        width: 1.6,
        depth: 0.9,
        height: 0.85,
        color: '#718096',
        imageUrl: 'https://images.unsplash.com/photo-1660491632751-3941540e383e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0d28lMjBzZWF0ZXIlMjBzb2ZhfGVufDF8fHx8MTc3MTE3MTA0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'sofa',
        name: '3-Seater Sofa',
        width: 2.1,
        depth: 0.9,
        height: 0.85,
        color: '#4A5568',
        imageUrl: 'https://images.unsplash.com/photo-1759722665629-29df6ee4f9a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMHNlYXRlciUyMHNvZmF8ZW58MXx8fHwxNzcxMTcxMDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'sofa',
        name: 'L-Shaped Sofa',
        width: 2.5,
        depth: 2.5,
        height: 0.85,
        color: '#2D3748',
        imageUrl: 'https://images.unsplash.com/photo-1698936061086-2bf99c7b9fc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMJTIwc2hhcGVkJTIwc2VjdGlvbmFsJTIwc29mYXxlbnwxfHx8fDE3NzExNzEwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */
    {
        type: 'sofa',
        name: 'Classic Sofa (3D)',
        width: 2.0,
        depth: 0.9,
        height: 0.9,
        color: '#5D4037',
        modelUrl: '/models/sofa.glb',
        imageUrl: '/images/classic-sofa.png',
    },
    {
        type: 'sofa',
        name: 'White Sofa (3D)',
        width: 2.2,
        depth: 0.9,
        height: 0.85,
        color: '#F5F5F5',
        modelUrl: '/models/white-sofa.glb',
        imageUrl: '/images/white-sofa.png',
    },
    {
        type: 'sofa', // Using Sofa type for Bedroom Set as it's a large set
        name: 'Bedroom Set (3D)',
        width: 2.2,
        depth: 2.4,
        height: 1.1,
        color: '#795548',
        modelUrl: '/models/bedroom set.glb',
        imageUrl: '/images/bedroom-set-1.png',
    },

    // Cabinets
    /*
    {
        type: 'cabinet',
        name: 'TV Cabinet',
        width: 1.8,
        depth: 0.45,
        height: 0.6,
        color: '#4A4A4A',
        imageUrl: 'https://images.unsplash.com/photo-1565058650109-849d383455ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUViUyMGNhYmluZXQlMjBtZWRpYSUyMGNvbnNvbGV8ZW58MXx8fHwxNzcxMTcxMDUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */
    {
        type: 'cabinet',
        name: 'Closet (3D)',
        width: 1.0,
        depth: 0.6,
        height: 2.0,
        color: '#8B4513',
        modelUrl: '/models/closet.glb',
        imageUrl: '/images/closet.png',
    },
    /*
    {
        type: 'cabinet',
        name: 'Bookshelf',
        width: 1.2,
        depth: 0.35,
        height: 2.0,
        color: '#654321',
        imageUrl: 'https://images.unsplash.com/photo-1758801966638-dfd34dae251c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rc2hlbGYlMjB3b29kZW4lMjBzaGVsdmluZ3xlbnwxfHx8fDE3NzExNzEwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        type: 'cabinet',
        name: 'Storage Cabinet',
        width: 0.8,
        depth: 0.4,
        height: 1.5,
        color: '#8B7355',
        imageUrl: 'https://images.unsplash.com/photo-1603308171650-d29647fef828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9yYWdlJTIwY2FiaW5ldCUyMHRhbGx8ZW58MXx8fHwxNzcxMTcxMDUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    */
];
