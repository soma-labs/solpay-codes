import {Container, Typography} from "@mui/material";

export default function Custom500() {
    return (
        <Container maxWidth="xl" sx={{p: 4}}>
            <Typography variant="h1" component="h1">
                500 - Server-side error occurred
            </Typography>
        </Container>
    );
}
