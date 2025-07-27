import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features?: string[];
}

export function PlaceholderPage({
  title,
  description,
  features = [],
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        <div className="space-y-2 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {description}
          </p>
        </div>

        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Construction className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                This feature is currently under development. We're working hard
                to bring you an amazing experience.
              </p>
            </div>

            {features.length > 0 && (
              <div className="space-y-4 max-w-lg mx-auto">
                <h3 className="font-semibold text-lg">Planned Features:</h3>
                <div className="grid gap-3 text-left">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full mt-2 shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" className="bg-background/50">
                Request Feature Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
