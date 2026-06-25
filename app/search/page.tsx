import { notFound } from "next/navigation";

export default async function GlobalSearch({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
    const params = await searchParams;
    const query = params.query?.trim();
    if (!query) return notFound()

    return <div>

    </div>
}