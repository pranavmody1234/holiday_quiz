
import { Suspense } from "react";
import ClientQuiz from "./ClientQuiz";

// Server Component to handle async params
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  // Await and extract the section parameter
  const { section } = await params;

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ClientQuiz section={section} />
    </Suspense>
  );
} 