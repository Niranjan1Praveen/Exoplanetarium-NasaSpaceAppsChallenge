import { SignUp } from "@clerk/nextjs";

function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp />
    </div>
  );
}

export default Page;
