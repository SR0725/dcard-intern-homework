import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { fetchGetIssue } from "@/hooks/useQueryIssue";
import { createSingletonOctokit } from "@/hooks/useOctokit";
import { redirect } from "next/navigation";
import "github-markdown-css/github-markdown-light.css";
import BlogEditorContainer from "@/components/blog/blog-editor-container";

const Page = async ({ params }: { params: { issueNumber: string } }) => {
  const session = await getServerSession(options);
  const octokit = createSingletonOctokit(session);
  const issue = await fetchGetIssue(octokit, Number(params.issueNumber));

  if (!session) {
    redirect("/sign-in");
  }

  if (!issue) {
    redirect("/404");
  }

  if (issue.user.id !== Number(session.user.id)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#00324E] pt-4">
      <BlogEditorContainer session={session} issue={issue} />
    </div>
  );
};

export default Page;
