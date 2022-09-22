import {PublicKey} from "@solana/web3.js";
import ProjectData from "./project-data";

export default async function getProjectData(owner: PublicKey, candyMachineId: PublicKey): Promise<ProjectData> {
    return fetch(`${process.env.NEXT_PUBLIC_DATA_API_URL}/projects/${owner.toString()}/${candyMachineId.toString()}`)
        .then(response => {
            if (response.status !== 200) {
                throw 'Failed to fetch project data';
            }

            return response.json();
        })
        .then(jsonResponse => {
            return new ProjectData(jsonResponse.data);
        });
}

export function getOwnerProjectsData(owner: PublicKey): Promise<ProjectData[]> {
    return fetch(`${process.env.NEXT_PUBLIC_DATA_API_URL}/projects?owner=${owner.toString()}`)
        .then(response => {
            if (response.status !== 200) {
                throw 'Failed to fetch owner projects data';
            }

            return response.json();
        })
        .then(jsonResponse => jsonResponse.data.map((projectData: any) => new ProjectData(projectData)));
}

export function getBatchProjectData(accountsInfo: Array<{owner: string, candyMachineId: string}>): Promise<ProjectData[]> {
    let formData = new FormData();

    accountsInfo.forEach((accountInfo, index) => {
        formData.append(`accountsInfo[${index}][owner]`, accountInfo.owner);
        formData.append(`accountsInfo[${index}][candyMachineId]`, accountInfo.candyMachineId);
    });

    return fetch(`${process.env.NEXT_PUBLIC_DATA_API_URL}/projects/batch`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: formData
    })
        .then(response => {
            if (response.status !== 200) {
                throw 'Failed to fetch projects data';
            }

            return response.json();
        })
        .then(jsonResponse => jsonResponse.data.map((projectData: any) => new ProjectData(projectData)));
}
