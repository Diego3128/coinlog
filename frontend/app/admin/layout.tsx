import { ReactNode } from "react";
import SimpleHeader from "../components/shared/SimpleHeader";
import PanelOptions from "../components/shared/PanelOptions";
import { UserType } from "@/src/schemas/auth/UserSchema";
import { getUserObject } from "@/src/auth/DAL";
import { getAuthTokens } from "@/src/lib/sessions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {


  const user:UserType | null = await getUserObject();

  if(!user) redirect("/auth/login"); //only used to get rid of null. This is already controlled in proxy.ts

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <header
        role="banner"
        className="bg-base-100 border-b border-base-300 p-1 flex justify-between"
      >
        <SimpleHeader />
        <PanelOptions user={user}/>
      </header>

      <div className="flex flex-1 ">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-base-100 border-r border-base-300 hidden md:block">
          <nav aria-label="Admin Navigation">
            <p>sidebar</p>
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" className=" w-full py-3 px-1.5">
          {children}
        </main>
      </div>
    </div>
  );
}
