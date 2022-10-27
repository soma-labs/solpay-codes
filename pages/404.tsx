import {Container, Typography} from "@mui/material";

export default function Custom404() {
    return (
        <Container maxWidth="xl" sx={{p: 4}}>
            <Typography variant="h1" component="h1">
                404 - Page Not Found
            </Typography>
        </Container>
    );
}
