"use client";

import { useState, useEffect } from "react";

export function useCurrentStore() {
    const [storeId, setStoreId] = useState<string | null>(null);
    const [storeName, setStoreName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get store info from cookies
        const getStoreInfo = async () => {
            try {
                const response = await fetch('/api/store/current');
                if (response.ok) {
                    const data = await response.json();
                    setStoreId(data.storeId);
                    setStoreName(data.storeName);
                }
            } catch (error) {
                console.error('Error getting store info:', error);
            } finally {
                setLoading(false);
            }
        };

        getStoreInfo();
    }, []);

    return { storeId, storeName, loading };
}
