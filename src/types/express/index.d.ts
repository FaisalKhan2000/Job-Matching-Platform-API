import { JwtPayload } from "../../types/types";

export {};

// declare global {
//   namespace Express {
//     interface Request {
//       user?: JwtPayload;
//     }
//   }
// }

// fixed error when using passport js
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
