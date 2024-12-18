import { NextApiResponse } from "next";
import { BaseServiceClass, METHOD } from "./base.service";


const controller = new AbortController();
const { signal } = controller;

export abstract class CRUDServiceClass<
EntityModel,
>
extends BaseServiceClass {
    abstract entityBaseUrl: string;

    async create(body: Record<string, any> | null | undefined , customHeaders: Record<string, string> = {}) : Promise<EntityModel> {
        return this.fetchHelper(`${this.entityBaseUrl}`, METHOD.POST, body, customHeaders, 'include' ,signal);
    }

    async read(customHeaders: Record<string, string> = {}) : Promise<NextApiResponse<Array<EntityModel>>> {
        return this.fetchHelper(`${this.entityBaseUrl}`, METHOD.GET, null, customHeaders , 'include' ,signal);
    }

    async update(body: Record<string, any> | null | undefined, customHeaders: Record<string, string> = {}) : Promise<EntityModel> {
        return this.fetchHelper(`${this.entityBaseUrl}`, METHOD.PUT, body, customHeaders, 'include' ,signal);
    }

    async delete(customHeaders: Record<string, string> = {}) : Promise<string> {
        return this.fetchHelper(`${this.entityBaseUrl}`, METHOD.DELETE, null, customHeaders,"include" ,signal);
    }
    
}