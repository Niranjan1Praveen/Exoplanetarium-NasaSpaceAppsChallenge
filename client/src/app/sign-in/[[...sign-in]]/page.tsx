import { SignIn } from "@clerk/nextjs";

function Page() {
  return (
    <div className="flex justify-center items-center">
      <SignIn />
    </div>
  );
}

export default Page;
