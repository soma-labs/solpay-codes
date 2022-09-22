import Link from "next/link";
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
            <section className="account d-flex justify-content-center">
                <aside className="account__sidebar col-2">
                    <nav className="account__navigation">
                        <ul className="account__menu">
                            <li className="account__menu-item">
                                <Link href="/admin/projects">
                                    <a className="account__menu-item__link">Projects</a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <div className="account__content col-10">
                    {children}
                </div>
            </section>
            : <h3>You cannot access this area.</h3>
    );
}
