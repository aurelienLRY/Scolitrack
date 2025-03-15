import Login from "@/components/auth/login";
export default function Home() {
  return (
    <section className="  flex flex-col min-h-[calc(100vh-170px)] ">
      <div className="flex-1 flex flex-col gap-8 items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="">Bienvenu</h1>
          <p className=" text-xl  ">
            sur <span className="text-accent text-6xl">ScoliTrack</span>
          </p>
          <hr className="w-1/2 border-t-2 border-gray-300 my-6 " />
        </div>
        <Login />
      </div>
    </section>
  );
}
