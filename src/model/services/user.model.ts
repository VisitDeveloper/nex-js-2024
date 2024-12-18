import { BaseModel } from "./base.model";

export interface UserModel extends BaseModel {
    name : string ; 
    email : string ; 
    
}


export interface UserModelArray  {
    data : Array<UserModel>
}



type User = 'admin' | 'user'
export interface CreateUserModel {
    name : string ;
    email : string ;
    type : User;

}


export interface UpdateUserModel { 
    name : string ;
    email : string ;
    type : User;
}