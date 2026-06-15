import {requireGuest} from "@/lib/auth";
import SignupForm from "./SignupForm";


export default async function SignupPage(){
    await requireGuest();
    return <SignupForm/>

}