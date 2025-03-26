import Login from "@/components/auth/Login";
import Image from "next/image";
export default function Home() {
  return (
    <section className="  flex flex-col min-h-[calc(100vh-170px)] relative ">
      <Image
        src="/img/bg-hero.svg"
        alt="background"
        fill
        className="object-cover absolute top-0 left-0 w-full h-full -z-10 fill-white  opacity-10"
      />
      <div className="flex-1 flex flex-col gap-8 items-center justify-center ">
        <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-md p-6 px-12 shadow-md">
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
