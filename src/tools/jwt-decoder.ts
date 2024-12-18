// import { jwtDecode } from "jwt-decode";
// import { IRole } from "pages/Login";

// export const jwtDecoder = (token: string): any => {
//   return jwtDecode(token); //// prints jwt body
// };
// export const getPermissionsFromToken = (
//   accessToken: string | null
// ): string[] => {
//   if (accessToken) return jwtDecoder(accessToken)?.realm_access?.roles;
//   else return [];
// };

// export const tokenDataDecoder = (token : string) : IRole | undefined  => {
//     if(token){
//         return jwtDecode(token)
//     } 
// }