import {useContext, useRef} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import Script from "next/script";
import {PopupMessageContext, PopupMessageTypes} from "../../src/providers/popup-message-provider";

declare global {
    interface Window {
        grecaptcha: any;
    }
}

export default function Projects() {
    const {setMessage} = useContext(PopupMessageContext);
    const formRef = useRef<HTMLFormElement>(null);
    const {wallet} = useContext(AuthContext);

    const onProjectRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        window.grecaptcha.ready(async () => {
            const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action: 'submit'});
            const formData = new FormData(formRef.current as HTMLFormElement);

            formData.append('token', token);

            try {
                const response = await fetch(`/api/project-registration`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                const jsonResponse = await response.json();

                if (jsonResponse.errors) {
                    setMessage(
                        Object
                            .entries(jsonResponse.errors)
                            .map((entry: [string, unknown]) => entry[1])
                            .join(`<br/>`),
                        PopupMessageTypes.Error
                    );

                    return;
                }

                setMessage(`Thank you for your registration! We'll contact you very soon.`, PopupMessageTypes.Success);

                formRef.current?.reset();
            } catch (e) {
                if (e instanceof Error) {
                    setMessage(e.message, PopupMessageTypes.Error);
                    return;
                }

                console.log(e);
            }
        });
    };

    return (
        wallet.connected ?
            <section className="d-flex justify-content-center">
                <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}/>
                <form ref={formRef} className="cma-project-form form" onSubmit={onProjectRegistrationFormSubmit}>
                    <p>
                        <label className="form-label w-100">
                            <span className="d-inline-block mb-1">Project title</span>
                            <input type="text" name="title" className="form-control w-100"/>
                        </label>
                    </p>
                    <p>
                        <label className="form-label w-100">
                            <span className="d-inline-block mb-1">Project description</span>
                            <textarea name="description" className="form-control w-100"></textarea>
                        </label>
                    </p>
                    <p>
                        <label className="form-label w-100">
                            <span className="d-inline-block mb-1">Contact (Discord / Twitter / E-mail)</span>
                            <input type="text" name="contact" className="form-control w-100"/>
                        </label>
                    </p>
                    <p>
                        <button className="button button--hollow">Register project</button>
                    </p>
                </form>
            </section> : null
    );
}
