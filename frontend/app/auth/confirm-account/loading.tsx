export default function loading() {
  return (
    <div className="absolute inset-0 flex justify-center items-center ">
      <div className="overflow-hidden rounded-full animate-spin">
        <div className="relative rounded-full size-8 border-4 border-primary ">
          <div className="bg-white rounded-full w-full h-full"></div>
          <span className="absolute size-1.5 bg-white top-0 -right-0.5 rotate-45"></span>
        </div>
      </div>
    </div>
  );
}
