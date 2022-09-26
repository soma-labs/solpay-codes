import Project from "../../models/project/project";

export default function ProjectsTable({projects, actions}: {projects: Project[], actions: any}) {
    return (
        <table className="projects-table table table-dark table-hover">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Title</th>
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
                                <img src={project.projectData?.image_url} className="projects-table__image" alt=""/>
                            </td>
                            <td>

                                {project.projectData?.title ?? project.projectAccount.data.candy_machine_id.toString()}
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
