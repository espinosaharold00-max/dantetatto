"use client";

import { useEffect, useState } from "react";
import { Check, X, Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReviewWithUser } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filterByStatus = (status: string) =>
    reviews.filter((r) => r.status === status);

  const ReviewCard = ({ review }: { review: ReviewWithUser }) => (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-400"
                  }`}
                />
              ))}
            </div>
            <p className="mb-2 text-sm text-neutral-300">{review.comment}</p>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>{review.user.name || "Anónimo"}</span>
              <span>•</span>
              <span>
                {format(new Date(review.createdAt), "d MMM yyyy", {
                  locale: es,
                })}
              </span>
            </div>
          </div>
          {review.status === "PENDING" && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateStatus(review.id, "APPROVED")}
                className="h-8 w-8 text-green-400 hover:text-green-300"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateStatus(review.id, "REJECTED")}
                className="h-8 w-8 text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="py-8 text-center text-neutral-400">Cargando...</div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Reseñas</h1>

      <Tabs defaultValue="PENDING">
        <TabsList className="mb-4 bg-neutral-800">
          <TabsTrigger value="PENDING" className="gap-2">
            Pendientes
            <Badge variant="outline" className="text-xs">
              {filterByStatus("PENDING").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="APPROVED">Aprobadas</TabsTrigger>
          <TabsTrigger value="REJECTED">Rechazadas</TabsTrigger>
        </TabsList>

        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-3">
            {filterByStatus(status).length === 0 ? (
              <p className="py-8 text-center text-neutral-400">
                No hay reseñas {status === "PENDING" ? "pendientes" : ""}
              </p>
            ) : (
              filterByStatus(status).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
