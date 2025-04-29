"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { id } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishedDate, setPublishedDate] = useState("");

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await fetch("/api/notion/page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pageId: id }),
        });

        const result = await res.json();

        if (result.success) {
          setPageData(result.data);
          const publishedOn = new Date(
            result.data.publishedOn
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          setPublishedDate(publishedOn);
        } else {
          console.error("Failed to fetch page:", result.error);
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPageData();
    }
  }, [id]);

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
        return <p className="my-4 ">{textContent}</p>;
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

  if (loading)
    return (
      <div className="p-4 w-screen h-screen grid place-items-center">
        Loading...
      </div>
    );

  if (!pageData)
    return (
      <div className="p-4 w-screen h-screen grid place-items-center">
        Error: No data found
      </div>
    );

  return (
    <div className=" mx-auto p-4 mt-10 max-w-[720px]">
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
  );
}
