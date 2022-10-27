import LoadingIcon from "../../src/components/loading-icon";
import {useEffect} from "react";
import {useRouter} from "next/router";
import { Container } from "@mui/material";

export default function Projects() {
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
