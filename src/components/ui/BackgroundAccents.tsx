export default function BackgroundAccents() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-900/20 blur-[120px] rounded-full"></div>
    </div>
  );
}
