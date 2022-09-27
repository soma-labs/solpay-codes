import {ReactNode, useContext, useEffect} from "react";
import {AuthContext} from "../../providers/auth-provider";
import {useRouter} from "next/router";

export default function AdminLayout({children}: {children?: ReactNode}) {
    const {wallet} = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN) {
            router.push(`/`);
        }
    }, [wallet.connected]);

    return (
        wallet.connected && wallet.publicKey?.toString() === process.env.NEXT_PUBLIC_SOLPAY_ADMIN ?
            <section className="admin">
                {children}
            </section>
            : <h3>You cannot access this area.</h3>
    );
}
