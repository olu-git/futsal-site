import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";
import EnquiryForm from "@/components/EnquiryForm";
import { RegisterButton } from "@/components/RegistrationProvider";
import { site } from "@/lib/site-content";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return <>
    <PageHero title="Contact Us" image={site.communityPhoto ?? site.actionPhoto} imageAlt={site.communityPhoto ? "The FIS community" : "Indoor futsal match"} />
    <section className="fis-section fis-container contact-layout">
      <div><h2 className="section-title">Get in touch</h2><p className="body-copy">Questions about Futsal Indoor Soccer? We&apos;re happy to help.</p>
        <ul className="contact-details">
          <li><Mail aria-hidden="true" /><a href={`mailto:${site.email}`}>{site.email}</a></li>
          <li><Phone aria-hidden="true" /><a href={site.telephone}>{site.phone}</a></li>
          <li><MapPin aria-hidden="true" /><a href={site.directions} target="_blank" rel="noopener noreferrer">{site.venue}<br />{site.address}</a></li>
        </ul>
      </div>
      <div><p className="registration-links">Want to join? Use <RegisterButton tab="team" className="inline-link">Team Registration</RegisterButton> or <RegisterButton tab="player" className="inline-link">Individual Registration</RegisterButton>.</p>
        <EnquiryForm kind="contact" />
      </div>
    </section>
  </>;
}
