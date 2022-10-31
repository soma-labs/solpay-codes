import {useContext, useRef, useState} from "react";
import Script from "next/script";
import {PopupMessageContext, PopupMessageTypes} from "../../src/providers/popup-message-provider";
import {Card, Container, FormControl, TextField, Typography} from "@mui/material";
import PageTitleWrapper from "../../src/tokyo-dashboard/components/PageTitleWrapper";
import {Stack} from "@mui/system";
import {LoadingButton} from "@mui/lab";

declare global {
    interface Window {
        grecaptcha: any;
    }
}

export default function Projects() {
    const {setMessage} = useContext(PopupMessageContext);
    const formRef = useRef<HTMLFormElement>(null);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    const onProjectRegistrationFormSubmit = async () => {
        if (isRegistering) {
            return;
        }

        setIsRegistering(true);

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

                setIsRegistering(false);

                setMessage(`Thank you for your registration! We'll contact you very soon.`, PopupMessageTypes.Success);

                formRef.current?.reset();
            } catch (e) {
                if (e instanceof Error) {
                    setMessage(e.message, PopupMessageTypes.Error);
                    return;
                }

                console.log(e);

                setIsRegistering(false);
            }
        });
    };

    return (
        <>
            <PageTitleWrapper>
                <Typography variant="h3" component="h3">
                    Register Your NFT Project
                </Typography>
            </PageTitleWrapper>

            <Container maxWidth="xs">
                <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}/>
                <Card sx={{p: 3}}>
                    <Stack spacing={2} component="form" ref={formRef} onSubmit={onProjectRegistrationFormSubmit}>
                        <FormControl>
                            <TextField
                                name="title"
                                label={`Project title`}
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <TextField
                                name="description"
                                label={`Project description`}
                                required
                                multiline
                                inputProps={{maxLength: 255}}
                                rows={7}
                                helperText="Max 255 characters"
                            />
                        </FormControl>
                        <FormControl>
                            <TextField
                                name="contact"
                                label={`Owner contact`}
                                required
                                helperText="Discord / Twitter / E-mail"
                            />
                        </FormControl>
                        <FormControl>
                            <LoadingButton
                                loading={isRegistering}
                                variant="contained"
                                onClick={() => {
                                    if (formRef.current) {
                                        if (formRef.current.reportValidity()) {
                                            onProjectRegistrationFormSubmit();
                                        }
                                    }
                                }}
                            >
                                Request Registration
                            </LoadingButton>
                        </FormControl>
                    </Stack>
                </Card>
            </Container>
        </>
    );
}
