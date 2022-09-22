import {useContext, useRef} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import Script from "next/script";

declare global {
    interface Window {
        grecaptcha: any;
    }
}

export default function Projects() {
    const formRef = useRef<HTMLFormElement>(null);
    const {wallet} = useContext(AuthContext);

    const onProjectRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        window.grecaptcha.ready(async () => {
            const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action: 'submit'});
            const formData = new FormData(formRef.current as HTMLFormElement);

            formData.append('token', token);

            const response = await fetch(`/api/project-registration`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            const jsonResponse = await response.json();

            console.log(jsonResponse);
        });
    };

    return (
        wallet.connected ?
            <section className="d-flex flex-column justify-content-center align-items-center">
                <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}/>
                <form ref={formRef} className="cma-project-form" onSubmit={onProjectRegistrationFormSubmit}>
                    <p>
                        <label className="w-100">
                            <span>Project title:</span>
                            <input type="text" name="title" className="w-100" required/>
                        </label>
                    </p>
                    <p>
                        <label className="w-100">
                            <span>Project description:</span>
                            <textarea name="description" className="w-100" required></textarea>
                        </label>
                    </p>
                    <p>
                        <label className="w-100">
                            <span>Contact:</span>
                            <input type="text" name="contact" className="w-100" required/>
                        </label>
                    </p>
                    <p>
                        <button className="button button--hollow">Register project</button>
                    </p>
                </form>
            </section> : null
    );
}
