import NextAuth from "next-auth";
import { authOptions } from "~/outing/server/auth";

export default NextAuth(authOptions);
