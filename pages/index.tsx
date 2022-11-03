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
import {Box, Button, Container, Divider, Grid, Typography, useMediaQuery, useTheme} from "@mui/material";
import PageTitleWrapper from "../src/tokyo-dashboard/components/PageTitleWrapper";
import LoadingIcon from "../src/components/loading-icon";
import {SolTokenIcon} from "../src/program/constants";

export default function Home() {
    const theme = useTheme();
    const isMediumDevice = useMediaQuery(theme.breakpoints.up('md'));
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
                <Box
                    className="accounts-filter
                    accounts-filter--projects"
                    display="flex"
                    flexDirection={isMediumDevice ? `row` : `column`}
                    justifyContent="space-between"
                >
                    <AccountsSearchFilter label="Search by title" defaultSearch={queryParamsSearch}/>
                    {!isMediumDevice && <Divider sx={{my: 2}}/>}
                    <AccountsOrderFilter
                        columns={ProjectOrderColumnsOptions}
                        defaultOrderBy={queryParamsOrdering?.orderBy}
                        defaultOrderDir={queryParamsOrdering?.orderDir}
                    />
                </Box>
            </PageTitleWrapper>

            <Container maxWidth="xl" sx={{paddingBottom: 4}}>
                <Grid container maxWidth={theme.breakpoints.values.lg} justifyContent="center" alignItems="center" sx={{margin: '0 auto 1rem auto'}}>
                    <Grid item xs={12} md={4} textAlign="center" mb={3}>
                        <Typography variant="h3" component="h3">
                            3
                        </Typography>
                        <Typography variant="h3" component="p">
                            NFT projects
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} textAlign="center" mb={3}>
                        <Typography variant="h3" component="h3">
                            1236{SolTokenIcon}
                        </Typography>
                        <Typography variant="h3" component="p">
                            in affiliate fees available!
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} textAlign="center" mb={3}>
                        <Typography variant="h3" component="h3">
                            21
                        </Typography>
                        <Typography variant="h3" component="p">
                            registered affiliates!
                        </Typography>
                    </Grid>
                </Grid>

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
                                    <Grid key={index} item xs={12} md={3}>
                                        <Link href={project.getLink()}>
                                            <a>
                                                <ProjectCard
                                                    title={project.getTitle()}
                                                    description={project.projectData?.description}
                                                    imageUrl={project.projectData?.image_url}
                                                    actions={[
                                                        <Button key={0} size="small" color="success" variant="contained">Register</Button>
                                                    ]}
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
