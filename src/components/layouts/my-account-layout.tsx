import Link from "next/link";
import {ReactNode, useContext} from "react";
import {AuthContext} from "../../providers/auth-provider";

export default function MyAccountLayout({children}: {children?: ReactNode}) {
    const {wallet} = useContext(AuthContext);

    return (
        wallet.connected ?
            <section className="account d-flex justify-content-center">
                <aside className="account__sidebar col-2">
                    <nav className="account__navigation">
                        <ul className="account__menu">
                            <li className="account__menu-item">
                                <Link href="/my-account/projects">
                                    <a className="account__menu-item__link">My projects</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/my-account/pending-projects">
                                    <a className="account__menu-item__link">My pending projects</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/my-account/affiliate-accounts">
                                    <a className="account__menu-item__link">My affiliate accounts</a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <div className="account__content col-10">
                    {children}
                </div>
            </section>
            : <h3>You need to be logged in to view your account.</h3>
    );
}
