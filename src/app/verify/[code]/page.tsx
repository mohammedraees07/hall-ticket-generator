import { redirect } from "next/navigation";

export default async function VerifyCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/verify?code=${encodeURIComponent(resolvedParams.code)}`);
}
