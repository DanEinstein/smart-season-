import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-6">
      <SignIn routing="path" path="/login" afterSignInUrl="/agent" />
    </div>
  );
}
