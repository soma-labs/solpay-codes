import Link from "next/link";
import ProjectCard from "../src/components/projects/project-card";
import useProjects from "../src/hooks/useProjects";
import SimplePagination from "../src/components/simple-pagination";
import useQueryParamsPagination from "../src/hooks/useQueryParamsPagination";
import useQueryParamsOrdering from "../src/hooks/useQueryParamsOrdering";
import {
    ProjectOrderByMap,
    ProjectOrderColumnsType, ProjectOrderColumnsOptions
} from "../src/program/project-accounts/ordering-helpers";
import AccountsOrderFilter from "../src/components/accounts-order-filter";
import AccountsSearchFilter from "../src/components/accounts-search-filter";
import useQueryParamsSearch from "../src/hooks/useQueryParamsSearch";
import {Box, Container, Grid} from "@mui/material";
import PageTitleWrapper from "../src/tokyo-dashboard/components/PageTitleWrapper";
import LoadingIcon from "../src/components/loading-icon";

export default function Home() {
    const queryParamsPagination = useQueryParamsPagination();
    const queryParamsOrdering = useQueryParamsOrdering();
    const queryParamsSearch = useQueryParamsSearch();
    const {projects, projectsLoading, pagination} = useProjects(
        false,
        0,
        queryParamsPagination,
        {
            orderBy: ProjectOrderByMap.get(queryParamsOrdering?.orderBy as ProjectOrderColumnsType),
            orderDir: queryParamsOrdering?.orderDir
        },
        queryParamsSearch
    );

    return (
        <>
            <PageTitleWrapper>
                <Box className="accounts-filter accounts-filter--projects" display="flex" justifyContent="space-between">
                    <AccountsSearchFilter label="Search by title" defaultSearch={queryParamsSearch}/>
                    <AccountsOrderFilter
                        columns={ProjectOrderColumnsOptions}
                        defaultOrderBy={queryParamsOrdering?.orderBy}
                        defaultOrderDir={queryParamsOrdering?.orderDir}
                    />
                </Box>
            </PageTitleWrapper>

            <Container maxWidth="xl" sx={{paddingBottom: 4}}>
                {projectsLoading ? <LoadingIcon/> :
                    <Box>
                        <Grid
                            container
                            direction="row"
                            spacing={4}
                            mb={4}
                        >
                            {
                                projects.map((project, index) =>
                                    <Grid key={index} item xs={3}>
                                        <Link href={project.getLink()}>
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
        </>
    );
}
