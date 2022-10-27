import Link from "next/link";
import ProjectCard from "../../src/components/projects/project-card";
import {useContext} from "react";
import {WalletPendingProjectsContext} from "../../src/providers/wallet-pending-projects-provider";
import PageTitleWrapper from "../../src/tokyo-dashboard/components/PageTitleWrapper";
import {Box, CircularProgress, Container, Grid, Typography} from "@mui/material";
import AuthenticatedPage from "../../src/components/authenticated-page";

export default function MyPendingProjects() {
    const {pendingProjectsLoading, pendingProjects} = useContext(WalletPendingProjectsContext);

    return (
        <AuthenticatedPage>
            <PageTitleWrapper>
                <Typography variant="h3" component="h3">
                    My Pending Projects
                </Typography>
            </PageTitleWrapper>

            <Container maxWidth="xl" sx={{paddingBottom: 4}}>
                {pendingProjectsLoading ?
                    <Box display="flex" justifyContent="center">
                        <CircularProgress/>
                    </Box>
                    :
                    <Box>
                        <Grid
                            container
                            direction="row"
                            spacing={4}
                            mb={4}
                        >
                            {
                                pendingProjects.map((project, index) =>
                                    <Grid key={index} component="div" item xs={3}>
                                        <Link
                                            href={`/my-pending-projects/${project.candy_machine_id.toString()}`}
                                        >
                                            <a>
                                                <ProjectCard
                                                    title={project?.title}
                                                    description={project?.description}
                                                    imageUrl={project?.image_url}
                                                />
                                            </a>
                                        </Link>
                                    </Grid>
                                )
                            }
                        </Grid>
                    </Box>
                }
            </Container>
        </AuthenticatedPage>
    );
}
