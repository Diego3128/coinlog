import Link from "next/link";

export default function page() {
  return (
    <div>
      <h1>page</h1>
      <Link href={'/about'}>about</Link>
    </div>
  );
}
