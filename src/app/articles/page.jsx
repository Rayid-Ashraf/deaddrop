import Article from "@/components/article";
import Header from "@/components/header";

export const dynamic = "force-static"; // Optional

export default async function Page() {
  const databaseId = "1e3ba73e900f80a5a7f3fe954c3d1e06";

  const res = await fetch(`https://deaddrop.space/api/notion/database`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ databaseId }),
  });

  const { data: articles = [] } = await res.json();

  return (
    <div>
      <Header page="articles" />
      <div className="max-w-[720px] mx-auto px-4 mt-12">
        <h1 className="text-5xl font-bold mb-8">Articles</h1>
        <div className="flex flex-col gap-2">
          {articles.map((article) => (
            <Article
              key={article.id}
              id={article.id}
              title={article.title}
              date={new Date(article.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
