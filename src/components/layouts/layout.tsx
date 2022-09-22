import Head from "next/head";
import Image from "next/image";
import {AuthContext} from "../../providers/auth-provider";
import {useContext} from "react";
import Link from "next/link";

export default function Layout({ children }: { children: any }) {
    const {wallet, login, logout} = useContext(AuthContext);

    return (
        <div className="cma-wrapper">
            <Head>
                <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
                <link rel="icon" href="/public/favicon.ico"/>
            </Head>

            <header className="cma-header">
                <nav className="cma-main-navigation d-flex align-items-center">
                    <ul className="cma-menu d-flex align-items-center">
                        <li className="cma-menu__item">
                            <Link href='/pages'>
                                <a>Home</a>
                            </Link>
                        </li>
                        <li className="cma-menu__item">
                            <Link href='/projects'>
                                <a>Projects</a>
                            </Link>
                        </li>
                        {wallet.connected &&
                            <li className="cma-menu__item">
                                <Link href='/my-account'>
                                    <a>My account</a>
                                </Link>
                            </li>
                        }
                        {wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN ? null :
                            <li className="account__menu-item">
                                <Link href="/admin">
                                    <a className="account__menu-item__link">Admin</a>
                                </Link>
                            </li>
                        }
                    </ul>
                    <button onClick={!wallet.connected ? login : logout} className={`ms-auto cma-login-button cma-login-button--` + (!wallet.connected ? `login` : `logout`)}>
                        <Image src={wallet.icon} alt="" width={32} height={32}/>
                        {!wallet.connected ? `Login with wallet` : `Logout`}
                    </button>
                </nav>
            </header>

            <main className="cma-main p-3">{children}</main>

            <footer className="cma-footer"></footer>
        </div>
    );
}
