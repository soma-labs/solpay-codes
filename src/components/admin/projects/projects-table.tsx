import Project from "../../../models/project/project";
import Image from "next/image";

export default function ProjectsTable({projects, actions}: {projects: Project[], actions: any}) {
    return (
        <table className="projects-table table table-dark table-hover">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Max affiliate count</th>
                    <th>Affiliate count</th>
                    <th>Created at</th>
                    <th>Updated at</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    projects.map((project, index) =>
                        <tr key={index}>
                            <td>
                                {index + 1}
                            </td>
                            <td>
                                <Image src={project.projectData?.image_url as string} className="projects-table__image" alt="NFT project image" width="50" height="50"/>
                            </td>
                            <td>
                                {project.projectAccount.data.title ?? project.projectAccount.data.candy_machine_id.toString()}
                            </td>
                            <td>
                                {project.projectAccount.data.max_affiliate_count}
                            </td>
                            <td>
                                {project.projectAccount.data.affiliate_count}
                            </td>
                            <td>
                                {project.projectAccount.createdAt()}
                            </td>
                            <td>
                                {project.projectAccount.updatedAt()}
                            </td>
                            <td>
                                {actions(project)}
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}
