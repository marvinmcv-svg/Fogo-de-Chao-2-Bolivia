import { Split } from "@/components/ui/Split";

export default function Home() {
  return (
    <section className="section container" style={{ paddingTop: "calc(var(--header-h) + 8rem)" }}>
      <Split as="h1" className="h1" text={"El fuego\n*no se apaga.*"} />
    </section>
  );
}
