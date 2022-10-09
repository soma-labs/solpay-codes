import React, {useState} from "react";
import useProjects from "../hooks/useProjects";
import Project from "../models/project/project";

export type WalletProjectsContextType = {
    walletProjects: Project[],
    walletProjectsLoading: boolean,
    refreshWalletProjects: () => void,
};

export const WalletProjectsContext = React.createContext<WalletProjectsContextType>({} as WalletProjectsContextType);

export default function WalletProjectsProvider({children}: {children: any}) {
    const [refreshWalletProjects, setRefreshWalletProjects] = useState<number>(Date.now());
    const walletProjects = useProjects(true, refreshWalletProjects, {
        // TODO: Implement pagination when list becomes too long
        perPage: -1
    });

    const defaultValue: WalletProjectsContextType = {
        walletProjects: walletProjects.projects,
        walletProjectsLoading: walletProjects.projectsLoading,
        refreshWalletProjects: () => setRefreshWalletProjects(Date.now()),
    };

    return (
        <WalletProjectsContext.Provider value={defaultValue}>
            {children}
        </WalletProjectsContext.Provider>
    );
}
