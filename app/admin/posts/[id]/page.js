import { db } from "@/lib/db";
import PostEditor from "@/components/PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }) {
  const result = await db.execute({
    sql: "SELECT * FROM posts WHERE id = ?",
    args: [params.id],
  });
  const post = result.rows[0];
  if (!post) notFound();

  return <PostEditor post={post} />;
}
