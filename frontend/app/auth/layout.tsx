import SplashIcon from "../components/icons/SplashIcon";
import FloatingIcons from "../components/shared/FloatingIcons";
import Header from "../components/shared/Header";

export default function layout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="md:flex">
      <div className="md:flex-1/2 pt-3 relative">
        <Header />
        <div className="hidden md:block  absolute bottom-0 left-0 w-full ">
          <div className="none md:block md:absolute z-10 bottom-20 left-0 w-full h-80">
            <FloatingIcons />
          </div>

          <div className="overflow-hidden">
            <div className="translate-y-50 rotate-45">
              <SplashIcon className="w-[20vw]" />
            </div>
          </div>
        </div>
      </div>
      <div className="md:flex-1/2  md:min-h-dvh md:flex md:items-center md:justify-center px-3 md:px-6 pb-10">
        <div className="relative min-h-60 w-full max-w-2xl bg-base-100 py-2 border border-accent rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
