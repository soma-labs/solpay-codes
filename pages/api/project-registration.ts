import type {NextApiRequest, NextApiResponse} from 'next';
import FormData from "form-data";

const GOOGLE_RECAPTCHA_VERIFY_URL = `https://www.google.com/recaptcha/api/siteverify`;

type RecaptchaResponseType = {
    success: boolean,
    challenge_ts: string,
    hostname: string,
    "error-codes": []
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(400).end();

        return;
    }

    const recaptchaVerificationResponse = await fetch(`${GOOGLE_RECAPTCHA_VERIFY_URL}?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.token}`, {
        method: 'POST'
    });
    const recaptchaVerificationJsonResponse = await recaptchaVerificationResponse.json();

    if (!recaptchaVerificationJsonResponse.success) {
        res.status(400).json({
            errors: {
                recaptcha: "ReCaptcha verification failed"
            }
        });

        return;
    }

    const formData = new FormData();

    formData.append('title', req.body.title);
    formData.append('description', req.body.description);
    formData.append('contact', req.body.contact);

    const projectRegistrationResponse = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_URL}/project-registration`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        // @ts-ignore
        body: formData
    });

    if (projectRegistrationResponse.status !== 200) {
        if (projectRegistrationResponse.status === 422) {
            const jsonProjectRegistrationResponse: RecaptchaResponseType = await projectRegistrationResponse.json();

            res.status(422).json(jsonProjectRegistrationResponse);

            return;
        }

        res.status(400).json({
            errors: {
                error: "Request failed"
            }
        });

        return;
    }

    const jsonProjectRegistrationResponse: RecaptchaResponseType = await projectRegistrationResponse.json();

    res.status(200).json({
        success: jsonProjectRegistrationResponse.success,
    });
}
