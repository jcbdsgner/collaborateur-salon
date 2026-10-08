import { SessionGate } from "@/components/providers/session-gate";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SessionGate requires="anonyme">{children}</SessionGate>;
}
