import {Card, CardActionArea, CardActions, CardContent, CardMedia, Typography} from "@mui/material";

type ProjectCardPropsType = {
    title?: string,
    description?: string,
    imageUrl?: string,
    actions?: any[],
};

export default function ProjectCard(props: ProjectCardPropsType) {
    return (
        <Card
            component="article"
            className="nft-project nft-project--loop"
        >
            <CardActionArea disableRipple>
                {props.imageUrl &&
                    <CardMedia
                        component="img"
                        image={props.imageUrl}
                        alt="NFT project image"
                        sx={{height: '20rem'}}
                    />
                }
                <CardContent>
                    <Typography gutterBottom variant="h3" component="h3" className="nft-project__title">
                        {props.title}
                    </Typography>
                    <Typography variant="body2" className="nft-project__description">
                        {props.description}
                    </Typography>
                </CardContent>
            </CardActionArea>

            {props.actions &&
                <CardActions>
                    {props.actions}
                </CardActions>
            }
        </Card>
    );
}
