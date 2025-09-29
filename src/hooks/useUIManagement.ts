
import { useState } from 'react';

export const useUIManagement = () => {
    const [contextMenu, setContextMenu] = useState<{ type: string; id: string | number } | null>(null);

    return {
        contextMenu, setContextMenu,
    };
};
