import { publicMetadata } from "@/lib/public-metadata";
import RegistrationContent from "@/components/RegistrationContent";

export const metadata = publicMetadata("Register", "Register a team or player for Futsal Indoor Soccer, or tell us about a future competition you want to join.", "/register/");

export default function RegisterPage() {
  return <section className="fis-container fis-section registration-page" aria-labelledby="register-page-title">
    <RegistrationContent idPrefix="register-page" />
  </section>;
}
