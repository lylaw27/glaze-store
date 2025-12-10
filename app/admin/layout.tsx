import Sidebar from "../components-admin-panel/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="mr-64 p-8">{children}</main>
    </div>
  );
}
