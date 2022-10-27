import {useContext} from "react";
import {AuthContext} from "../providers/auth-provider";
import {Container, Typography} from "@mui/material";

export default function AuthenticatedPage({children}: {children: any}) {
    const {wallet} = useContext(AuthContext);

    return (
        <>
            {!wallet.connected ?
                <Container maxWidth="xl" sx={{p: 3}}>
                    <Typography variant="h3" component="h3">
                        You must be logged in to view this page.
                    </Typography>
                </Container>
                :
                children
            }
        </>
    );
}
