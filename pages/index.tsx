import Link from "next/link";
import LoadingIcon from "../src/components/loading-icon";
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
        <section className="nft-projects">
            <div className="px-3">
                <div className="accounts-filter accounts-filter--projects d-flex justify-content-between align-items-center">
                    <AccountsSearchFilter label="Search by title" defaultSearch={queryParamsSearch}/>
                    <AccountsOrderFilter
                        columns={ProjectOrderColumnsOptions}
                        defaultOrderBy={queryParamsOrdering?.orderBy}
                        defaultOrderDir={queryParamsOrdering?.orderDir}
                    />
                </div>
            </div>
            {projectsLoading ?
                <LoadingIcon/>
                :
                <>
                    <div className="d-flex flex-wrap">
                        {
                            projects.map((project, index) =>
                                <div key={index} className="nft-project-item col-12 col-md-3">
                                    <ProjectCard
                                        title={project.projectAccount.data.title || project.projectAccount.data.candy_machine_id.toString()}
                                        description={project.projectData?.description}
                                        imageUrl={project.projectData?.image_url}
                                        actions={[
                                            <Link
                                                key={0}
                                                href={`/projects/${project.projectAccount.data.project_owner_pubkey.toString()}/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                                <a className="button button--hollow">View project</a>
                                            </Link>
                                        ]}
                                    />
                                </div>)
                        }
                    </div>
                    <SimplePagination pagination={pagination} classVariation={`project-list`}/>
                </>
            }
        </section>
    );
}
