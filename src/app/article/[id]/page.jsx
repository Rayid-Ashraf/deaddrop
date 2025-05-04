import { Client } from "@notionhq/client";
import { cache } from "react";

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_TOKEN });

const getPageData = cache(async (pageId) => {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const blocks = await notion.blocks.children.list({ block_id: pageId });

  const titleProperty = page.properties?.Title || page.properties?.Name;
  const publishedOnProperty = page.properties?.["Published on"];

  const title = titleProperty?.title?.[0]?.plain_text || "Untitled";
  const publishedOn = publishedOnProperty?.date?.start || null;

  return {
    id: page.id,
    title,
    publishedOn,
    content: blocks.results,
  };
});

export async function generateMetadata({ params }) {
  const { id } = params;
  const pageData = await getPageData(id);

  return {
    title: `${pageData.title} | DeadDrop Articles`,
    description: `Read ${pageData.title} on DeadDrop. Published on ${new Date(
      pageData.publishedOn
    ).toLocaleDateString()}`,
    openGraph: {
      title: pageData.title,
      description: `Read ${pageData.title} on DeadDrop. Published on ${new Date(
        pageData.publishedOn
      ).toLocaleDateString()}`,
      type: "article",
      publishedTime: pageData.publishedOn,
    },
  };
}

export const revalidate = 60;

export default async function Page({ params }) {
  const { id } = params;
  const pageData = await getPageData(id);
  const publishedDate = new Date(pageData.publishedOn).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const renderBlockContent = (block) => {
    if (!block[block.type]?.rich_text) return null;

    const textContent = block[block.type].rich_text
      .map((text) => text.plain_text)
      .join("");

    switch (block.type) {
      case "heading_1":
        return <h1 className="text-4xl font-bold mt-6 mb-3">{textContent}</h1>;
      case "heading_2":
        return <h2 className="text-3xl font-bold mt-6 mb-3">{textContent}</h2>;
      case "heading_3":
        return (
          <h3 className="text-2xl font-semibold mt-4 mb-2">{textContent}</h3>
        );
      case "paragraph":
        return <p className="my-4">{textContent}</p>;
      case "bulleted_list_item":
        return (
          <ul className="list-disc ml-6 my-1">
            <li>{textContent}</li>
          </ul>
        );
      case "numbered_list_item":
        return (
          <ol className="list-decimal ml-6 my-1">
            <li>{textContent}</li>
          </ol>
        );
      default:
        return <p className="my-2">{textContent}</p>;
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageData.title,
    datePublished: pageData.publishedOn,
    author: {
      "@type": "Organization",
      name: "DeadDrop",
      url: "https://deaddrop.space",
    },
    publisher: {
      "@type": "Organization",
      name: "DeadDrop",
      logo: {
        "@type": "ImageObject",
        url: "https://deaddrop.space/logo.svg",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto p-4 mt-10 max-w-[720px]">
        <div className="mb-6">
          Published on{" "}
          <span className="!text-white font-medium">{publishedDate}</span>
        </div>
        <h1 className="text-4xl font-black mb-8">
          {pageData.title || "Untitled"}
        </h1>
        <div className="prose">
          {pageData.content.length > 0 ? (
            pageData.content.map((block, index) => (
              <div key={index}>{renderBlockContent(block)}</div>
            ))
          ) : (
            <p>No content found</p>
          )}
        </div>
      </div>
    </>
  );
}
