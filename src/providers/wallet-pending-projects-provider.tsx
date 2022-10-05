import React, {useState} from "react";
import usePendingProjects from "../hooks/usePendingProjects";
import ProjectData from "../models/project/project-data";

export type WalletPendingProjectsContextType = {
    pendingProjects: ProjectData[],
    pendingProjectsLoading: boolean,
    refreshPendingProjects: () => void,
};

export const WalletPendingProjectsContext = React.createContext<WalletPendingProjectsContextType>({} as WalletPendingProjectsContextType);

export default function WalletPendingProjectsProvider({children}: {children: any}) {
    const [refreshPendingProjects, setRefreshPendingProjects] = useState<number>(Date.now());
    const {pendingProjects, pendingProjectsLoading} = usePendingProjects(refreshPendingProjects);

    const defaultValue: WalletPendingProjectsContextType = {
        pendingProjects: pendingProjects,
        pendingProjectsLoading: pendingProjectsLoading,
        refreshPendingProjects: () => setRefreshPendingProjects(Date.now())
    };

    return (
        <WalletPendingProjectsContext.Provider value={defaultValue}>
            {children}
        </WalletPendingProjectsContext.Provider>
    );
}
