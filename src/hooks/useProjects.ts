import Project from "../models/project/project";
import {useContext, useEffect, useState} from "react";
import getProjectAccounts, {GetProjectAccountsOptionsType} from "../program/project-accounts/get-project-accounts";
import {getBatchProjectData} from "../models/project/get-project-data";
import getProjects from "../models/project/get-projects";
import {AuthContext} from "../providers/auth-provider";
import {PopupMessageContext, PopupMessageTypes} from "../providers/popup-message-provider";
import {DefaultPaginationOptions, PaginationOptionsType, PaginationType} from "../program/pagination-utils";

type ProjectsHookReturnType = {
    projects: Project[];
    projectsLoading: boolean;
    pagination: PaginationType,
};

export default function useProjects(
    forCurrentWallet: boolean = false,
    refresh: number = 0,
    paginationOptions: PaginationOptionsType = DefaultPaginationOptions
): ProjectsHookReturnType {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [pagination, setPagination] = useState<PaginationType>({} as PaginationType);

    useEffect(() => {
        (async () => {
            setProjectsLoading(true);

            const projectAccountsOptions: GetProjectAccountsOptionsType = {};

            if (forCurrentWallet) {
                if (!wallet.publicKey) {
                    setProjects([]);
                    setProjectsLoading(false);
                    return;
                }

                projectAccountsOptions.owner = wallet.publicKey;
            }

            if (paginationOptions.page) {
                projectAccountsOptions.page = paginationOptions.page;
            }

            if (paginationOptions.perPage) {
                projectAccountsOptions.perPage = paginationOptions.perPage;
            }

            try {
                const projectAccounts = await getProjectAccounts(connection, projectAccountsOptions);

                if (!projectAccounts.items.length) {
                    setProjects([]);
                    setProjectsLoading(false);
                    return;
                }

                const projectsData = await getBatchProjectData(
                    projectAccounts.items.map(projectAccount => {
                        return {
                            owner: projectAccount.data.project_owner_pubkey.toString(),
                            candyMachineId: projectAccount.data.candy_machine_id.toString()
                        };
                    })
                );

                setProjects(getProjects(projectAccounts.items, projectsData));
                setPagination(projectAccounts.pagination);
                setProjectsLoading(false);
            } catch (e) {
                if (e instanceof Error) {
                    setMessage(e.message, PopupMessageTypes.Error);
                } else {
                    console.log(e);
                }

                setProjects([]);
                setProjectsLoading(false);
            }
        })();
    }, [wallet.connected, refresh, paginationOptions.page, paginationOptions.perPage]);

    return {
        projects,
        projectsLoading,
        pagination
    };
}
