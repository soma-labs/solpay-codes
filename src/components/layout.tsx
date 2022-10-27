import Head from "next/head";
import {AuthContext} from "../providers/auth-provider";
import {useContext} from "react";
import Link from "next/link";
import {WalletPendingProjectsContext} from "../providers/wallet-pending-projects-provider";
import {WalletProjectsContext} from "../providers/wallet-projects-provider";
import {WalletAffiliateAccountsContext} from "../providers/wallet-affiliate-accounts-provider";
import Image from "next/image";

export default function Layout({ children }: { children: any }) {
    const {
        wallet,
        showWalletsModal,
        logout
    } = useContext(AuthContext);
    const {walletProjects} = useContext(WalletProjectsContext);
    const {pendingProjects} = useContext(WalletPendingProjectsContext);
    const {walletHasAffiliateAccounts} = useContext(WalletAffiliateAccountsContext);

    return (
        <div className="cma-wrapper d-flex">
            <Head>
                <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
                <link rel="icon" href="/solpay-codes-favicon.jpg"/>
            </Head>

            <main className="cma-main d-flex">
                <header className="cma-header">
                    <nav className="cma-main-navigation d-flex align-items-center justify-content-end">
                        {wallet.connected &&
                            <Link href="/projects/new">
                                <a className="button button--hollow button--register-project me-3">Register your project</a>
                            </Link>
                        }
                        <button onClick={!wallet.connected ? showWalletsModal : logout} className={`cma-login-button cma-login-button--${!wallet.connected ? `login` : `logout`}`}>
                            {!wallet.connected ? `Login with wallet` : `Logout`}
                        </button>
                    </nav>
                </header>
                <aside className="cma-main__sidebar px-3 pt-3">
                    <div className="cma-main__sidebar__logo mb-5">
                        <Link href="/">
                            <a>
                                <Image src={`/images/solpay-codes-logo.jpg`} alt="solpay.codes logo" width={183.6} height={183.6}/>
                            </a>
                        </Link>
                    </div>
                    <ul className="cma-menu d-flex flex-column">
                        {wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN ? null :
                            <li className="cma-menu__item">
                                <i className="cma-menu__item__icon fa fa-chart-bar"></i>
                                <Link href="/admin">
                                    <a>Admin</a>
                                </Link>
                            </li>
                        }
                        <li className="cma-menu__item">
                            <i className="cma-menu__item__icon fa fa-list"></i>
                            <Link href='/'>
                                <a>Projects</a>
                            </Link>
                        </li>
                        {walletHasAffiliateAccounts &&
                            <li className="cma-menu__item">
                                <i className="cma-menu__item__icon fa fa-sack-dollar"></i>
                                <Link href='/my-earnings'>
                                    <a>My earnings</a>
                                </Link>
                            </li>
                        }
                    </ul>
                    {wallet.connected && pendingProjects.length ?
                        <>
                            <span className="cma-menu-name">My Pending Projects</span>
                            <ul className="cma-menu d-flex flex-column">
                                {pendingProjects.map(
                                    (pendingProject, index) =>
                                        <li key={index} className="cma-menu__item">
                                            <Link href={`/my-pending-projects/${pendingProject.candy_machine_id.toString()}`}>
                                                <a>{pendingProject.title}</a>
                                            </Link>
                                        </li>
                                )}
                            </ul>
                        </> : null
                    }
                    {wallet.connected && walletProjects.length ?
                        <>
                            <span className="cma-menu-name">My Projects</span>
                            <ul className="cma-menu d-flex flex-column">
                                {walletProjects.map(
                                    (project, index) =>
                                        <li key={index} className="cma-menu__item">
                                            <Link href={`/my-projects/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                                <a>{project.getTitle()}</a>
                                            </Link>
                                        </li>
                                )}
                            </ul>
                        </> : null
                    }
                </aside>
                <div className="cma-main__content">
                    {children}
                </div>
            </main>
        </div>
    );
}
