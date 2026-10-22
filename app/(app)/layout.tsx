import Topbar from "@/components/Topbar";
import TabBar from "@/components/TabBar";
import DonateBar from "@/components/DonateBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone">
      <Topbar />
      {children}
      <DonateBar />
      <TabBar />
    </div>
  );
}
