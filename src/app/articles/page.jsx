import Article from "@/components/article";
import Header from "@/components/header";
import { Client } from "@notionhq/client";
import { cache } from "react";

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_TOKEN });

const getArticles = cache(async () => {
  const databaseId = "1e3ba73e900f80a5a7f3fe954c3d1e06";

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Status",
      select: {
        equals: "Published",
      },
    },
    sorts: [
      {
        property: "Published on",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page) => {
    const titleProp = page.properties.Title || page.properties.Name;
    const dateProp = page.properties["Published on"];
    const rawDate = dateProp?.date?.start;

    return {
      id: page.id,
      title: titleProp?.title?.[0]?.plain_text || "Untitled",
      date: rawDate || "No date",
    };
  });
});

export const revalidate = 60;

export default async function Page() {
  const articles = await getArticles();

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
              date={
                article.date !== "No date"
                  ? new Date(article.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "No date"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
