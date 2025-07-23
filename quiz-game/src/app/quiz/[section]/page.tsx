import { Suspense } from "react";
import ClientQuiz from "./ClientQuiz";

// Server Component to handle async params
export default function Page({ params }: { params: { section: string } }) {
  const { section } = params;

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ClientQuiz section={section} />
    </Suspense>
  );
}