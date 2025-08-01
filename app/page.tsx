import { redirect } from "next/navigation";

export default function HomePage() {
  // This is the root page. It always redirects to /login.
  // The initial authentication check and subsequent redirect to /dashboard (if already logged in)
  // will now be handled client-side within the LoginPage component's useEffect hook.
  redirect("/login");

  // This component will not render anything as it always redirects.
  return null;
}
