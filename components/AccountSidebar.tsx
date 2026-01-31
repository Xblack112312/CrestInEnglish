import { ChevronLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const AccountSidebar = () => {
  
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="flex items-start flex-col w-80">
      <div className="flex items-center flex-row gap-2">
        <ChevronLeft onClick={() => router.replace("/")} size={23} className="cursor-pointer aspect-square transition-all hover:bg-black/5 w-6 h-6 rounded-full" />
        <h1 className="text-3xl font-semibold text-black">Settings.</h1>
      </div>
      <div className="flex flex-col w-full items-start mt-4">
      <button className={`bg-gray-400/10 ${pathname === "/profile" ? "bg-black! text-white" : "hover:bg-gray-400/25"} transition-all flex text-start flex-row p-2 rounded-lg cursor-pointer font-medium w-full`}>
         Account Settings
      </button>

      <hr className="w-full mt-4" />

        <button onClick={async () => {
          await signOut();
        }} className={`bg-gray-400/5 underline  mt-3 transition-all flex text-start flex-row p-2 rounded-lg cursor-pointer font-medium w-full`}>
         Sign Out
      </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
