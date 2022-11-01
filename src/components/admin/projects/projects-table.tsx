import Project from "../../../models/project/project";
import Image from "next/image";
import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink, Typography} from "@mui/material";
import Link from "next/link";

export default function ProjectsTable({projects, actions}: {projects: Project[], actions: any}) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Max affiliate count</TableCell>
                        <TableCell>Affiliate count</TableCell>
                        <TableCell>Created at</TableCell>
                        <TableCell>Updated at</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        projects.map((project, index) =>
                            <TableRow key={index}>
                                <TableCell>
                                    <Link href={project.getLink()}>
                                        <a>
                                            <Box sx={{width: 50, height: 50, position: 'relative'}}>
                                                <Image src={project.projectData?.image_url as string} className="projects-table__image" alt="NFT project image" width="50" height="50"/>
                                            </Box>
                                        </a>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link href={project.getLink()}>
                                        <a>
                                            <Typography>
                                                <MuiLink component="span">
                                                    {project.projectAccount.data.title ?? project.projectAccount.data.candy_machine_id.toString()}
                                                </MuiLink>
                                            </Typography>
                                        </a>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {project.projectAccount.data.max_affiliate_count}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {project.projectAccount.data.affiliate_count}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {project.projectAccount.createdAt()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {project.projectAccount.updatedAt()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {actions(project)}
                                </TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
