import Head from "next/head";
import Image from "next/image";
import {AuthContext} from "../../providers/auth-provider";
import {useContext} from "react";
import Link from "next/link";
import usePendingProjects from "../../hooks/usePendingProjects";
import useProjects from "../../hooks/useProjects";

export default function Layout({ children }: { children: any }) {
    const {
        wallet,
        hasAffiliateAccounts,
        login,
        logout
    } = useContext(AuthContext);
    const {pendingProjects} = usePendingProjects();
    const {projects} = useProjects(true);

    return (
        <div className="cma-wrapper d-flex">
            <Head>
                <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
                <link rel="icon" href="/public/favicon.ico"/>
            </Head>

            <main className="cma-main d-flex">
                <header className="cma-header">
                    <nav className="cma-main-navigation d-flex align-items-center justify-content-end">
                        {wallet.connected &&
                            <Link href="/projects/new">
                                <a className="button button--hollow button--register-project me-3">Register new NFT project</a>
                            </Link>
                        }
                        <button onClick={!wallet.connected ? login : logout} className={`cma-login-button cma-login-button--` + (!wallet.connected ? `login` : `logout`)}>
                            <Image src={wallet.icon} alt="" width={32} height={32}/>
                            {!wallet.connected ? `Login with wallet` : `Logout`}
                        </button>
                    </nav>
                </header>
                <aside className="cma-main__sidebar px-3 pt-3">
                    <div className="cma-main__sidebar__logo mb-5">
                    </div>
                    <ul className="cma-menu d-flex flex-column">
                        {wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN ? null :
                            <li className="cma-menu__item">
                                <Link href="/admin">
                                    <a>Admin</a>
                                </Link>
                            </li>
                        }
                        <li className="cma-menu__item">
                            <Link href='/'>
                                <a>Projects</a>
                            </Link>
                        </li>
                        {hasAffiliateAccounts &&
                            <li className="cma-menu__item">
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
                    {wallet.connected && projects.length ?
                        <>
                            <span className="cma-menu-name">My Projects</span>
                            <ul className="cma-menu d-flex flex-column">
                                {projects.map(
                                    (project, index) =>
                                        <li key={index} className="cma-menu__item">
                                            <Link href={`/my-projects/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                                <a>{project.projectData?.title || project.projectAccount.data.candy_machine_id.toString()}</a>
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
