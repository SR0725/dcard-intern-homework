import { Issue } from "@/models/issue";
import { Session } from "next-auth";
import useOctokit from "./useOctokit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Octokit } from "@octokit/core";

interface ContentData {
  title?: string;
  body?: string;
  state?: "open" | "closed";
}

async function fetchPatchIssue(
  octokit: Octokit,
  issueNumber: number,
  newContent: ContentData,
): Promise<Issue> {
  const repoName = process.env.NEXT_PUBLIC_REPO_NAME;
  const owner = process.env.NEXT_PUBLIC_REPO_OWNER;

  if (!repoName || !owner) {
    throw new Error("Missing environment variables");
  }

  const response = await octokit.request(
    `PATCH /repos/${owner}/${repoName}/issues/${issueNumber}`,
    {
      owner,
      repo: repoName,
      issue_number: issueNumber,
      ...newContent,
    },
  );
  return response.data;
}

function useUpdateIssue(issueNumber: number, session: Session) {
  const octokit = useOctokit(session);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newContent: ContentData) =>
      fetchPatchIssue(octokit, issueNumber, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueNumber] });
    },
  });

  return mutation;
}

export default useUpdateIssue;
