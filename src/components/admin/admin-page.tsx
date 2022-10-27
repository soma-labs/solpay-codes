import {ReactNode, useContext, useEffect} from "react";
import {AuthContext} from "../../providers/auth-provider";
import {useRouter} from "next/router";
import {Container, Typography} from "@mui/material";

export default function AdminPage({children}: {children?: ReactNode}) {
    const {wallet} = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN) {
            router.push(`/`);
        }
    }, [wallet.connected]);

    return (
        <>
            {!wallet.connected || wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN ?
                <Container maxWidth="xl" sx={{p: 3}}>
                    <Typography variant="h3" component="h3">
                        You cannot access this area.
                    </Typography>
                </Container>
                :
                children
            }
        </>
    );
}
