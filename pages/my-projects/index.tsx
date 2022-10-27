import Link from "next/link";
import useProjects from "../../src/hooks/useProjects";
import LoadingIcon from "../../src/components/loading-icon";
import ProjectCard from "../../src/components/projects/project-card";
import useQueryParamsPagination from "../../src/hooks/useQueryParamsPagination";
import SimplePagination from "../../src/components/simple-pagination";
import {Box, CircularProgress, Container, Grid, Typography} from "@mui/material";
import PageTitleWrapper from "../../src/tokyo-dashboard/components/PageTitleWrapper";
import AuthenticatedPage from "../../src/components/authenticated-page";

export default function MyProjects() {
    const paginationOptions = useQueryParamsPagination();
    const {projects, projectsLoading, pagination} = useProjects(true, 0, paginationOptions);

    return (
        <AuthenticatedPage>
            <PageTitleWrapper>
                <Typography variant="h3" component="h3">
                    My Projects
                </Typography>
            </PageTitleWrapper>

            <Container maxWidth="xl" sx={{paddingBottom: 4}}>
                {projectsLoading ?
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
                                projects.map((project, index) =>
                                    <Grid key={index} component="div" item xs={3}>
                                        <Link
                                            href={`/my-projects/${project.projectAccount.data.project_owner_pubkey.toString()}/${project.projectAccount.data.candy_machine_id.toString()}`}
                                        >
                                            <a>
                                                <ProjectCard
                                                    title={project.getTitle()}
                                                    description={project.projectData?.description}
                                                    imageUrl={project.projectData?.image_url}
                                                />
                                            </a>
                                        </Link>
                                    </Grid>
                                )
                            }
                        </Grid>
                        <Grid item xs={12}>
                            <SimplePagination pagination={pagination} classVariation={`project-list`}/>
                        </Grid>
                    </Box>
                }
            </Container>
        </AuthenticatedPage>
    );
}
