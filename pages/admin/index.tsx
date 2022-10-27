import Link from "next/link";
import AdminPage from "../../src/components/admin/admin-page";
import LoadingIcon from "../../src/components/loading-icon";
import closeProjectAccount from "../../src/program/project-accounts/close-project-account";
import {AuthContext} from "../../src/providers/auth-provider";
import {useContext, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../../src/providers/popup-message-provider";
import Project from "../../src/models/project/project";
import ProjectsTable from "../../src/components/admin/projects/projects-table";
import {WalletProjectsContext} from "../../src/providers/wallet-projects-provider";
import useProjects from "../../src/hooks/useProjects";
import useQueryParamsPagination from "../../src/hooks/useQueryParamsPagination";
import SimplePagination from "../../src/components/simple-pagination";
import {sleep} from "@toruslabs/base-controllers";
import {Box, Button, Card, CardHeader, Container, Divider, IconButton, Typography} from "@mui/material";
import PageTitleWrapper from "../../src/tokyo-dashboard/components/PageTitleWrapper";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Admin() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const {refreshWalletProjects} = useContext(WalletProjectsContext);
    const paginationOptions = useQueryParamsPagination();
    const [refreshProjects, setRefreshProjects] = useState<number>((new Date()).getTime());
    const {projects, projectsLoading, pagination} = useProjects(false, refreshProjects, paginationOptions);

    const onCloseProjectAction = async (project: Project) => {
        try {
            await closeProjectAccount({
                owner: project.projectAccount.data.project_owner_pubkey,
                candyMachineId: project.projectAccount.data.candy_machine_id
            }, wallet, connection);

            await sleep(1000);

            refreshWalletProjects();
            setRefreshProjects((new Date()).getTime());
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }
        }
    };

    const renderActions = (project: Project) =>
        <>
            <Link href={`/admin/projects/${project.projectAccount.data.project_owner_pubkey.toString()}/${project.projectAccount.data.candy_machine_id.toString()}`}>
                <a>
                    <IconButton
                        aria-label="Edit Project"
                        size="small"
                        color="primary"
                        title="Edit Project"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </a>
            </Link>
            <IconButton
                aria-label="Close Project"
                color="error"
                size="small"
                title="Close Project"
                onClick={onCloseProjectAction.bind(null, project)}
            >
                <DeleteIcon fontSize="small"/>
            </IconButton>
        </>;

    return (
        <AdminPage>
            <PageTitleWrapper>
                <Typography variant="h3" component="h3">
                    Admin
                </Typography>
            </PageTitleWrapper>

            <Container maxWidth="xl" sx={{paddingBottom: 4}}>
                {projectsLoading ?
                    <LoadingIcon/>
                    :
                    <>
                        <Card>
                            <CardHeader title="NFT Projects"/>
                            <Divider/>
                            <ProjectsTable projects={projects} actions={renderActions}/>
                            {pagination.pageCount < 2 ? null :
                                <Box p={2}>
                                    <SimplePagination pagination={pagination} classVariation={`projects-list`}/>
                                </Box>
                            }
                        </Card>
                    </>
                }
            </Container>
        </AdminPage>
    );
}
