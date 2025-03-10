import { ThemeSwitch } from "@/components/layout/theme-swith/ThemeSwitch";

export default function Home() {
  return (
    <div className=" min-h-screen flex flex-col ">
      <ThemeSwitch />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-8xl">Bienvenu</h1>
        <h2 className="text-4xl text-primary ">sur theme color</h2>
        <button className="bg-secondary  px-4 py-2 rounded-md mt-11">
          Theme color
        </button>
      </div>
    </div>
  );
}
