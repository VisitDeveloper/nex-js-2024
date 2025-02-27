import { ArticleModel } from "model/services/post.model";
// https://jsonplaceholder.typicode.com/posts
import { CRUDServiceClass } from "./crud.service";
import { METHOD } from "./base.service";
import qs from "qs";

export class ArticleService extends CRUDServiceClass<ArticleModel> {
  entityBaseUrl = "articles";

  // async getAllUsers(url: string = this.addUrl,customHeaders: any) {
  //     return this.fetchHelper(url, METHOD.GET, null, customHeaders , 'include' ,signal);
  // }

  async fetchOneArticle(
    url: string = this.entityBaseUrl,
    customHeaders: any,
    signal: any,
    params?: Record<string, unknown>
  ) {
    return this.fetchHelper(
      url + (!!params ? "?" + qs.stringify(params) : ""),
      METHOD.GET,
      null,
      customHeaders,
      "include",
      signal
    );
  }
}
