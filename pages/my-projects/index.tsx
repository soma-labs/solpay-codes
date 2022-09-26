import Link from "next/link";
import useProjects from "../../src/hooks/useProjects";
import LoadingIcon from "../../src/components/loading-icon";
import ProjectCard from "../../src/components/projects/project-card";

export default function MyProjects() {
    const {projects, projectsLoading} = useProjects(true);

    return (
        <section className="nft-projects d-flex flex-wrap">
            {projectsLoading ?
                <LoadingIcon/>
                :
                projects.map((project, index) =>
                    <div key={index} className="nft-project-item col-12 col-md-3">
                        <ProjectCard
                            title={project.projectData?.title || project.projectAccount.data.candy_machine_id.toString()}
                            description={project.projectData?.description}
                            imageUrl={project.projectData?.image_url}
                            actions={[
                                <Link key={0} href={`/projects/${project.projectAccount.data.project_owner_pubkey.toString()}/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                    <a className="button button--hollow">View project</a>
                                </Link>
                            ]}
                        />
                    </div>)
            }
        </section>
    );
}
