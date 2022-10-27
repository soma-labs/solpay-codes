import LoadingIcon from "../../src/components/loading-icon";
import {useRouter} from "next/router";
import {useEffect} from "react";
import { Container } from "@mui/material";

export default function MintRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push(`/`);
    }, []);

    return (
        <Container maxWidth="xl" sx={{p: 4}}>
            <LoadingIcon/>
        </Container>
    );
}
