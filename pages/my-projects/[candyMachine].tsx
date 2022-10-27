import {useRouter} from "next/router";
import useProject from "../../src/hooks/useProject";
import {useContext} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import LoadingIcon from "../../src/components/loading-icon";
import Image from "next/image";
import AuthenticatedPage from "../../src/components/authenticated-page";
import {Box, Container, Grid, List, ListItem, Typography} from "@mui/material";

export default function MyProjectDetails() {
    const router = useRouter();
    const {candyMachine} = router.query;
    const {wallet} = useContext(AuthContext);
    const {projectLoading, project} = useProject(wallet.publicKey?.toString() as string, candyMachine as string);

    return (
        <AuthenticatedPage>
            <Container maxWidth="xl" sx={{p: 3}} className="nft-project nft-project--single">
                {projectLoading ? <LoadingIcon/>: !project ? null :
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Box className="nft-project__image-container">
                                {project.projectData?.image_url &&
                                    <Image src={project.projectData.image_url} className="nft-project__image" alt="" layout="fill"/>
                                }
                            </Box>
                        </Grid>

                        <Grid item xs>
                            <Box component="header" className="nft-project__header" mb={3}>
                                <Typography variant="h1" className="nft-project__title" mb={2}>
                                    {project.getTitle()}
                                </Typography>

                                <Typography component="p" className="nft-project__description">
                                    {project.projectData?.description}
                                </Typography>
                            </Box>

                            <Box component="section" className="nft-project__details">
                                <Typography component="h3" variant="h3" className="nft-project__title" mb={2}>
                                    Details
                                </Typography>

                                <List dense disablePadding>
                                    <ListItem disableGutters>
                                        <strong>Created at:</strong>&nbsp;{project.projectAccount.createdAt()}
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <strong>Updated at:</strong>&nbsp;{project.projectAccount.updatedAt()}
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <strong>Affiliate fee:</strong>&nbsp;{project.projectAccount.data.affiliate_fee_percentage}%
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <strong>Affiliate target:</strong>&nbsp;{project.projectAccount.data.affiliate_target_in_sol}◎
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <strong>Max affiliate count:</strong>&nbsp;{project.projectAccount.data.max_affiliate_count}
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <strong>Affiliate count:</strong>&nbsp;{project.projectAccount.data.affiliate_count}
                                    </ListItem>
                                </List>
                            </Box>
                        </Grid>
                    </Grid>
                }
            </Container>
        </AuthenticatedPage>
    );
}
