import { LoginFormSection } from "@/components/organisms/LoginFormSection";
import { AuthTemplate } from "@/components/templates/AuthTemplate";

export default function LoginPage() {
  return (
    <AuthTemplate>
      <LoginFormSection />
    </AuthTemplate>
  );
}
