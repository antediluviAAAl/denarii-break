"use client";
import { useRouter } from "next/navigation";
import CoinModal from "../../../../components/CoinModal";

export default function InterceptedCoinPage({ params }) {
  const router = useRouter();
  const { id } = params;

  return <CoinModal coinId={id} onClose={() => router.back()} />;
}
