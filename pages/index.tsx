import Link from "next/link";
import LoadingIcon from "../src/components/loading-icon";
import ProjectCard from "../src/components/projects/project-card";
import useProjects from "../src/hooks/useProjects";
import SimplePagination from "../src/components/simple-pagination";
import useQueryParamsPagination from "../src/hooks/useQueryParamsPagination";

export default function Home() {
    const paginationOptions = useQueryParamsPagination();
    const {projects, projectsLoading, pagination} = useProjects(false, 0, paginationOptions);

    return (
        <section className="nft-projects">
            {projectsLoading ?
                <LoadingIcon/>
                :
                <>
                    <div className="d-flex flex-wrap">
                        {
                            projects.map((project, index) =>
                                <div key={index} className="nft-project-item col-12 col-md-3">
                                    <ProjectCard
                                        title={project.projectData?.title || project.projectAccount.data.candy_machine_id.toString()}
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
