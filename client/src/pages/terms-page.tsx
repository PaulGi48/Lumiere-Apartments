import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. About these terms",
    content: [
      "These Terms and Conditions govern your use of the Lumiere Apartments website and your requests to view, reserve, or book residential accommodation through the platform. In these terms, “Lumiere”, “we”, “us”, and “our” mean Lumiere Apartments, and “you” means the person using the platform.",
      "Please read these terms before creating an account or making a booking. By using the platform, you agree to these terms. If you do not agree, do not use the platform.",
    ],
  },
  {
    title: "2. Our role",
    content: [
      "Lumiere is a property discovery and booking platform. Unless a listing expressly says otherwise, we act as an intermediary connecting guests with property owners, landlords, operators, or their authorised representatives.",
      "A listing does not by itself create a tenancy, lease, sale, agency, valuation, or other property interest. The final agreement for occupation or other use of a property is between the relevant parties and may require a separate written agreement.",
    ],
  },
  {
    title: "3. Eligibility and accounts",
    content: [
      "You must be at least 18 years old and legally capable of entering a contract to use the platform. You are responsible for the accuracy of the information you provide and for keeping your login credentials confidential.",
      "You must not impersonate another person, create an account for fraudulent purposes, or use the platform to bypass a booking, payment, identity, or property-management process.",
    ],
  },
  {
    title: "4. Listings and availability",
    content: [
      "We aim to keep property descriptions, images, prices, amenities, availability, and location information accurate. Property details may be supplied or updated by owners, operators, or their representatives, and minor differences between images and the property may occur.",
      "A listing is subject to availability and may be corrected, withdrawn, or changed before a booking is confirmed. We do not warrant that every listing is suitable for your personal requirements; you should ask questions and carry out any checks you consider necessary before committing.",
    ],
  },
  {
    title: "5. Booking requests and confirmation",
    content: [
      "Submitting a booking request does not guarantee acceptance. A booking becomes binding only when the platform or the relevant property representative sends a confirmation stating that the request has been accepted.",
      "You must provide truthful guest, contact, identification, and arrival information. We may refuse, cancel, or request additional verification for a booking where information is inaccurate, payment is unsuccessful, the property is unavailable, or fraud or misuse is suspected.",
    ],
  },
  {
    title: "6. Prices, fees, and payment",
    content: [
      "Prices are displayed in the selected currency where available. The applicable price, taxes, deposits, service charges, cleaning charges, utilities, and other fees will be shown or communicated before confirmation where reasonably practicable.",
      "You authorise us or our payment provider to process the amounts you approve. Payment-provider terms may also apply. We will not ask you to disclose your card PIN, online-banking password, or one-time authentication code through the platform.",
    ],
  },
  {
    title: "7. Cancellations, refunds, and changes",
    content: [
      "Cancellation and refund rights depend on the policy shown for the relevant property or booking. If no specific policy is displayed, please contact us before cancelling so we can confirm the applicable terms.",
      "Where a refund is approved, it will normally be returned through the original payment method, subject to payment-provider processing times, bank charges, and any lawful deductions. We may offer an alternative property or reasonable remedy where a confirmed property becomes unavailable.",
    ],
  },
  {
    title: "8. Guest responsibilities and property rules",
    content: [
      "You must use the property lawfully, follow reasonable house rules, respect neighbours and security procedures, and comply with applicable Nigerian federal, state, and local laws. You must not conduct illegal activity, cause nuisance, exceed the confirmed occupancy, damage the property, or transfer a booking without permission.",
      "You are responsible for loss or damage caused by you or your guests beyond ordinary wear and tear. You may be required to pay reasonable repair, replacement, cleaning, or call-out costs supported by appropriate evidence.",
    ],
  },
  {
    title: "9. Inspections and access",
    content: [
      "For safety, maintenance, emergencies, inspections, or property-management purposes, the owner, operator, or authorised representative may need reasonable access to the property. Except in an emergency, reasonable notice should be given where practicable.",
      "You should report safety issues, defects, missing items, or damage promptly through the contact channel provided for the booking.",
    ],
  },
  {
    title: "10. Reviews and user content",
    content: [
      "If you submit a review, photograph, message, or other content, you confirm that it is accurate to the best of your knowledge, lawful, non-infringing, and not misleading. You grant Lumiere a non-exclusive licence to display that content for operating and promoting the platform.",
      "We may remove content that is unlawful, abusive, discriminatory, defamatory, deceptive, or unrelated to the relevant property or service.",
    ],
  },
  {
    title: "11. Privacy and communications",
    content: [
      "We process account, booking, contact, payment-status, and support information to operate the platform, provide services, prevent fraud, and comply with legal obligations. We will handle personal data in accordance with applicable Nigerian data-protection law, including the Nigeria Data Protection Act 2023, and our privacy information when provided.",
      "By registering or making a booking, you agree that we may send service messages about your account, booking, property access, security, and support. Marketing messages will include an appropriate way to opt out where required.",
    ],
  },
  {
    title: "12. Professional and regulatory matters",
    content: [
      "Information on the platform is not legal, valuation, surveying, tax, investment, or financial advice. Where a transaction requires a licensed estate surveyor, valuer, agent, solicitor, title search, consent, registration, or other professional service, you should obtain independent advice from a properly qualified Nigerian professional.",
      "Nothing in these terms authorises any person to hold themselves out as a registered estate surveyor or valuer where registration is required by Nigerian law.",
    ],
  },
  {
    title: "13. Availability and liability",
    content: [
      "We use reasonable care to operate the platform, but we do not guarantee uninterrupted access, error-free content, or that every property or service will meet your expectations. The platform may be unavailable for maintenance, security, connectivity, or events outside our reasonable control.",
      "To the extent permitted by law, we are not liable for indirect or consequential loss, loss of profit, loss of opportunity, or loss caused by a property owner, operator, guest, payment provider, utility provider, or other third party. Nothing in these terms limits liability that cannot lawfully be limited, including liability for fraud or death or personal injury caused by negligence.",
    ],
  },
  {
    title: "14. Suspension and termination",
    content: [
      "We may suspend or close an account, cancel a booking, or restrict access where you breach these terms, provide false information, fail to pay, create a security risk, or misuse the platform. Ending access does not remove obligations that arose before termination.",
    ],
  },
  {
    title: "15. Governing law and disputes",
    content: [
      "These terms are governed by the laws of the Federal Republic of Nigeria. We encourage you to contact us first so we can try to resolve a complaint fairly and promptly. Where a dispute cannot be resolved informally, it may be referred to a court or other dispute-resolution forum with appropriate jurisdiction in Nigeria, subject to any mandatory rights available to a consumer.",
    ],
  },
  {
    title: "16. Changes and contact",
    content: [
      "We may update these terms as the platform, services, or applicable law changes. The updated version will be posted on this page with a new effective date. Continued use after an update means you accept the revised terms.",
      "For questions, complaints, or booking support, please use the contact details provided in your booking confirmation or the support channel on the Lumiere platform.",
    ],
  },
];

export default function TermsPage() {
  return (
    <Layout>
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to apartments
          </Link>
        </Button>

        <Card>
          <CardContent className="prose prose-slate max-w-none p-6 md:p-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Lumiere Apartments</p>
            <h1>Terms &amp; Conditions</h1>
            <p className="lead">Effective date: 23 October 2026</p>
            <p>
              This page is a general platform terms template for a Nigerian real-estate and accommodation service. It should be reviewed and completed with Lumiere’s legal name, business address, contact details, booking policies, and any state-specific requirements before it is relied on as a final legal document.
            </p>

            {sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}

            <hr />
            <p className="text-sm text-muted-foreground">
              The consumer-protection and data-protection references reflected in this template include the Federal Competition and Consumer Protection Act 2018 and the Nigeria Data Protection Act 2023. This page does not replace professional legal advice.
            </p>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
