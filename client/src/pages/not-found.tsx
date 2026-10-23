import { ErrorPage } from "@/components/error-page";

export default function NotFound() {
  return <ErrorPage status={404} title="That page has moved" message="We could not find this address. Returning you to Lumiere." />;
}
