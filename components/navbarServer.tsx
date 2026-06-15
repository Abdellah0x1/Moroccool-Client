import { getCurrentUser, getCurrentProfile } from "@/lib/auth"
import { Navbar } from "./navbar";

export async function NavbarServer() {
    const user = await getCurrentUser();
    const Profile = await getCurrentProfile();
    return <>
        <Navbar user={user} profile={Profile} />
    </>
}
