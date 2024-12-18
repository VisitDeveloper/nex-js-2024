import { CRUDServiceClass } from "./crud.service";
import { UserModelArray } from 'model/services/user.model'

export class UserService extends CRUDServiceClass<UserModelArray> {

   entityBaseUrl = "user";

    // async getAllUsers(url: string = this.addUrl,customHeaders: any) {
    //     return this.fetchHelper(url, METHOD.GET, null, customHeaders , 'include' ,signal);
    // }

}