import { BaseServiceClass, METHOD } from "./base.service";

import { NextApiResponse } from "next";
import qs from "qs";

const controller = new AbortController();
const { signal } = controller;
export abstract class CRUDServiceClass<EntityModel> extends BaseServiceClass {
  abstract entityBaseUrl: string;

  async create(
    body: Record<string, any> | null | undefined,
    customHeaders: Record<string, string> = {}
  ): Promise<EntityModel> {
    return this.fetchHelper(
      `${this.entityBaseUrl}`,
      METHOD.POST,
      body,
      customHeaders,
      "include",
      signal
    );
  }

  async read(
    body?: Record<string, any> | null | undefined,
    customHeaders: Record<string, string> = {},
    params?: Record<string, any> | null | undefined
  ): Promise<NextApiResponse<Array<EntityModel>>> {
    return this.fetchHelper(
      `${this.entityBaseUrl}${!!params ? "?" + qs.stringify(params) : ""}`,
      METHOD.GET,
      null,
      customHeaders,
      "include",
      signal
    );
  }

  async update(
    body: Record<string, any> | null | undefined,
    customHeaders: Record<string, string> = {}
  ): Promise<EntityModel> {
    return this.fetchHelper(
      `${this.entityBaseUrl}`,
      METHOD.PUT,
      body,
      customHeaders,
      "include",
      signal
    );
  }

  async delete(customHeaders: Record<string, string> = {}): Promise<string> {
    return this.fetchHelper(
      `${this.entityBaseUrl}`,
      METHOD.DELETE,
      null,
      customHeaders,
      "include",
      signal
    );
  }
}
