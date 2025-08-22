import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Filter } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const EmptyState = ({ hasFilters, onClearFilters }: EmptyStateProps) => {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="px-8 py-12 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          {hasFilters ? (
            <Filter className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Users className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">
            {hasFilters ? 'No therapists match your search' : 'No therapists available'}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {hasFilters 
              ? 'Try adjusting your search criteria or filters to find more therapists.' 
              : 'We\'re currently working on adding more qualified therapists to our platform.'
            }
          </p>
        </div>

        {hasFilters && (
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;