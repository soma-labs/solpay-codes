import LoadingIcon from "../../src/components/loading-icon";
import Link from "next/link";
import ProjectCard from "../../src/components/projects/project-card";
import usePendingProjects from "../../src/hooks/usePendingProjects";

export default function MyPendingProjects() {
    const {pendingProjectsLoading, pendingProjects} = usePendingProjects();

    return (
        <section className="nft-projects d-flex flex-wrap">
            {pendingProjectsLoading ?
                <LoadingIcon/>
                :
                pendingProjects.map((project, index) =>
                    <div key={index} className="nft-project-item col-12 col-md-3">
                        <ProjectCard
                            title={project?.title}
                            description={project?.description}
                            imageUrl={project?.image_url}
                            actions={[
                                <Link key={0} href={`/my-account/pending-projects/${project.candy_machine_id.toString()}`}>
                                    <a className="button button--hollow">Finish registration</a>
                                </Link>
                            ]}
                        />
                    </div>)
            }
        </section>
    );
}
