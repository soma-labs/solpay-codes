import {useEffect, useState} from "react";

export type SiteStatsHookReturnType = null | {
    projectAccounts: number,
    affiliateAccounts: number,
    solInAffiliateFeesAvailable: number,
};

export default function useSiteStats() {
    const [stats, setStats] = useState<SiteStatsHookReturnType>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/api/site-stats`);
                const jsonResponse = await response.json();

                setStats(jsonResponse);
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    return stats;
}
