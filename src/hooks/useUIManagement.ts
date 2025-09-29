
import { useState } from 'react';

export const useUIManagement = () => {
    const [contextMenu, setContextMenu] = useState<{ type: string; id: string | number; x: number; y: number } | null>(null);

    return {
        contextMenu, setContextMenu,
    };
};
