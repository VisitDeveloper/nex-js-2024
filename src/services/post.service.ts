// https://jsonplaceholder.typicode.com/posts
import { CRUDServiceClass } from "./crud.service";
import { PostModel } from 'model/services/post.model'

export class PostService extends CRUDServiceClass<PostModel> {

   entityBaseUrl = "posts";

    // async getAllUsers(url: string = this.addUrl,customHeaders: any) {
    //     return this.fetchHelper(url, METHOD.GET, null, customHeaders , 'include' ,signal);
    // }

}